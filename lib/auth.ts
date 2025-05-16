import type { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import type { IUser } from "./models/user"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!
const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || JWT_SECRET

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets must be defined")
}

export interface JwtPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export interface VerificationPayload {
  email: string
  iat?: number
  exp?: number
}

export function generateTokens(user: IUser) {
  // Access token expires in 30 minutes (increased from 15 minutes)
  const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30m" })

  // Refresh token expires in 7 days
  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })

  return { accessToken, refreshToken }
}

export function generateVerificationToken(email: string) {
  // Verification token expires in 24 hours
  return jwt.sign({ email }, VERIFICATION_SECRET, { expiresIn: "1h" })
}

export function verifyVerificationToken(token: string): VerificationPayload {
  try {
    return jwt.verify(token, VERIFICATION_SECRET) as VerificationPayload
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Verification link has expired")
    }
    throw new Error(`Invalid verification token: ${error.message}`)
  }
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error: any) {
    // Add more detailed error information
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired")
    }
    throw new Error(`Invalid token: ${error.message}`)
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string }
  } catch (error: any) {
    // Add more detailed error information
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired")
    }
    throw new Error(`Invalid refresh token: ${error.message}`)
  }
}

export async function getAuthUser(req: NextRequest) {
  // Try to get from Authorization header first
  const authHeader = req.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]
    try {
      return verifyToken(token)
    } catch (error) {
      console.error("Auth header token verification failed:", error)
      // Continue to try cookie auth
    }
  }

  // If no Authorization header or it failed, try cookies
  const { accessToken } = await getTokens()
  if (!accessToken) {
    throw new Error("No token provided")
  }

  try {
    return verifyToken(accessToken)
  } catch (error) {
    console.error("Cookie token verification failed:", error)
    throw error
  }
}

export function setTokenCookies(
  res: NextResponse,
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string },
) {
  // Set access token cookie
  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 60, // 30 minutes (increased from 15 minutes)
    path: "/",
  })

  // Set refresh token cookie
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })

  return res
}

export function clearTokenCookies(res: NextResponse) {
  res.cookies.set("accessToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  })

  return res
}

export async function getTokens() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value
  const refreshToken = cookieStore.get("refreshToken")?.value

  return { accessToken, refreshToken }
}
