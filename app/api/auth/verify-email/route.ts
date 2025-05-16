import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import PendingUser from "@/lib/models/pending-user"
import { verifyVerificationToken, generateTokens, setTokenCookies } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    try {
      // Verify the token
      const payload = verifyVerificationToken(token)
      const { email } = payload

      // Check if user already exists and is verified
      const existingUser = await User.findOne({ email })
      if (existingUser && existingUser.isVerified) {
        // User is already verified, just return success
        const tokens = generateTokens(existingUser)
        const response = NextResponse.json({
          message: "Email already verified",
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
          },
        })
        return setTokenCookies(response, tokens)
      }

      // If user exists but is not verified
      if (existingUser && !existingUser.isVerified) {
        existingUser.isVerified = true
        existingUser.verifiedAt = new Date()
        await existingUser.save()

        const tokens = generateTokens(existingUser)
        const response = NextResponse.json({
          message: "Email verified successfully",
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
          },
        })
        return setTokenCookies(response, tokens)
      }

      // Find the pending user
      const pendingUser = await PendingUser.findOne({ email })
      if (!pendingUser) {
        return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 })
      }

      // Create a new verified user
      const newUser = new User({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password, // Already hashed
        isVerified: true,
        verifiedAt: new Date(),
      })

      await newUser.save()

      // Delete the pending user
      await PendingUser.deleteOne({ _id: pendingUser._id })

      // Generate tokens and set cookies
      const tokens = generateTokens(newUser)
      const response = NextResponse.json({
        message: "Email verified successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      })

      return setTokenCookies(response, tokens)
    } catch (error: any) {
      console.error("Verification error:", error)
      return NextResponse.json({ error: error.message || "Invalid verification token" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Email verification failed" }, { status: 500 })
  }
}
