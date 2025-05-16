import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/lib/models/user"
import { verifyRefreshToken, generateTokens, setTokenCookies, getTokens } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { refreshToken } = await getTokens()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 401 })
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken)

    // Find user
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new tokens
    const tokens = generateTokens(user)

    // Create response
    const response = NextResponse.json({
      message: "Token refreshed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })

    // Set cookies
    return setTokenCookies(response, tokens)
  } catch (error: any) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Token refresh failed" }, { status: 401 })
  }
}
