import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import { generateTokens, setTokenCookies } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log('email',email)
    // Find user by email
    const user = await User.findOne({ email })
    console.log('user',user)

    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: "Email not verified",
          needsVerification: true,
          email: user.email,
        },
        { status: 403 },
      )
    }

    // Check password
    const isMatch = user.password === password
    // const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate tokens
    const tokens = generateTokens(user)

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })

    // Set cookies
    return setTokenCookies(response, tokens)
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
