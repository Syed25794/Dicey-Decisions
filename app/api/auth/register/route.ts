import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import { sendVerificationEmail } from "@/lib/email-service"
import PendingUser from "@/lib/models/pending-user"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 })
      } else {
        // If user exists but is not verified, send a new verification email
        await sendVerificationEmail(email, name)
        return NextResponse.json(
          { message: "Verification email sent. Please check your inbox to complete registration." },
          { status: 200 },
        )
      }
    }

    const existingPendingUser = await PendingUser.findOne({ email })
    if( existingPendingUser ){
      await PendingUser.deleteOne({email})
    }
    // Create a pending user
    const pendingUser = new PendingUser({
      name,
      email,
      password,
    })

    await pendingUser.save()

    // Send verification email
    await sendVerificationEmail(email, name)

    return NextResponse.json(
      { message: "Verification email sent. Please check your inbox to complete registration." },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
