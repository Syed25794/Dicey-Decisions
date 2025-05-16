import { type NextRequest, NextResponse } from "next/server"
import { clearTokenCookies } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message: "Logged out successfully",
    })

    return clearTokenCookies(response)
  } catch (error: any) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
