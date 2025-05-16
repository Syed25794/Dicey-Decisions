import type { NextRequest } from "next/server"
import { verifyToken, getTokens } from "@/lib/auth"

export async function getAuthenticatedUser(req: NextRequest) {
  // Try to get from Authorization header first
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]
    return verifyToken(token)
  }

  // If no Authorization header, try cookies
  const { accessToken } = await getTokens()
  if (!accessToken) {
    throw new Error("Not authenticated")
  }

  return verifyToken(accessToken)
}
