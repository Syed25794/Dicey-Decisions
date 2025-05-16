import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/me",
  ]

  const path = request.nextUrl.pathname
  
  if( path === '/rooms/join' ){
    const roomCode = request.nextUrl.searchParams.get('code')
    const accessToken = request.cookies.get("accessToken")?.value

    if (!accessToken) {
      return NextResponse.redirect(new URL(`/login?code=${roomCode}`, request.url))
    }
  }
  // Check if the path is public
  if (publicPaths.some((publicPath) => path === publicPath || path.startsWith(publicPath))) {
    return NextResponse.next()
  }

  // For API routes, check Authorization header or cookies
  if (path.startsWith("/api/")) {
    // Check Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1]
        verifyToken(token)
        return NextResponse.next()
      } catch (error) {
        // If header token is invalid, check cookies
        const accessToken = request.cookies.get("accessToken")?.value
        if (!accessToken) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        try {
          verifyToken(accessToken)
          return NextResponse.next()
        } catch (error) {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
      }
    }

    // If no Authorization header, check cookies
    const accessToken = request.cookies.get("accessToken")?.value
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      verifyToken(accessToken)
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  }

  // For page routes, check cookies
  const accessToken = request.cookies.get("accessToken")?.value

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    verifyToken(accessToken)
    return NextResponse.next()
  } catch (error) {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
