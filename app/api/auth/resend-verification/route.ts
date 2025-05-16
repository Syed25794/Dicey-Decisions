import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import PendingUser from "@/lib/models/pending-user"
import { sendVerificationEmail } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists but is not verified
    const existingUser = await User.findOne({ email, isVerified: false })

    if (existingUser) {
      // User exists but is not verified, send a new verification email
      await sendVerificationEmail(email, existingUser.name)
      return NextResponse.json({ message: "Verification email sent" }, { status: 200 })
    }

    // Check if there's a pending user
    const pendingUser = await PendingUser.findOne({ email })

    if (pendingUser) {
      // Pending user exists, send a new verification email
      await sendVerificationEmail(email, pendingUser.name)
      return NextResponse.json({ message: "Verification email sent" }, { status: 200 })
    }

    // No user found with this email
    return NextResponse.json({ error: "No pending registration found for this email" }, { status: 404 })
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 })
  }
}
