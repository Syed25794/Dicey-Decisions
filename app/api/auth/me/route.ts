import { type NextRequest, NextResponse } from "next/server"
import { getTokens, verifyToken } from "@/lib/auth"
import dbConnect from "@/lib/db"
import User from "@/lib/models/user"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get tokens from cookies
    const { accessToken, refreshToken } = await getTokens()

    // If no access token, return unauthorized
    if (!accessToken) {
      console.log("No access token found in /api/auth/me")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      // Verify the access token
      const payload = verifyToken(accessToken)

      // Get user from database
      const user = await User.findById(payload.userId).select("_id name email")

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Return user data
      return NextResponse.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error: any) {
      console.error("Token verification error in /api/auth/me:", error)

      // If token is expired or invalid, return unauthorized
      return NextResponse.json({ error: "Unauthorized: " + error.message }, { status: 401 })
    }
  } catch (error: any) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
