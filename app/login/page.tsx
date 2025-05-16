"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, AlertCircle, Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const { login, loading, error, clearError, user, setError } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get return_to and room_code from URL parameters
  useEffect(() => {
    const roomCode = searchParams.get("code")

    if (roomCode) {
      setRoomCode(roomCode)
    }
  }, [searchParams])

  // Handle redirect after authentication
  useEffect(() => {
    if (!user || loading || redirecting) return

    // Set redirecting flag to prevent multiple redirects
    setRedirecting(true)
    console.log("👤 User authenticated, handling redirect")

    // Handle redirection after a short delay to ensure cookies are set
    setTimeout(() => {
      try {
        // Handle redirection based on returnTo and roomCode
        if (roomCode) {
          if (roomCode) {
            const redirectUrl = `/rooms/join?code=${roomCode}`
            console.log(`🔄 Redirecting to room join: ${redirectUrl}`)
            window.location.href = redirectUrl // Use direct navigation instead of router
          }
        } else {
          console.log("🔄 Redirecting to dashboard")
          window.location.href = "/dashboard" // Use direct navigation instead of router
        }
      } catch (error) {
        console.error("❌ Redirect error:", error)
        // Fallback to dashboard if there's an error
        window.location.href = "/dashboard"
      }
    }, 500) // Increased delay to ensure cookies are properly set
  }, [user, loading, roomCode, router, redirecting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email || !password) {
      return
    }

    console.log("🔐 Submitting login with returnTo:", returnTo, "roomCode:", roomCode)
    
    try {
      await login(email,password)
    } catch (error: any) {
      console.error("Login error:", error)
      clearError()
      setError(error.message)
    }
  }

  const handleResendVerification = async () => {
    if (!email || resendingVerification) return

    setResendingVerification(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification email")
      }

      // Redirect to verification pending page
      router.push(`/verification-pending?email=${encodeURIComponent(email)}`)
    } catch (error: any) {
      console.error("Resend verification error:", error)
      clearError()
      setError(error.message)
    } finally {
      setResendingVerification(false)
    }
  }

  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Email Not Verified</CardTitle>
            <CardDescription className="text-center">Your email address has not been verified yet</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="bg-yellow-100 rounded-full p-4 mb-6">
              <Mail className="h-12 w-12 text-yellow-500" />
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-700">
                Please check your inbox at <span className="font-medium">{email}</span> and click the verification link
                to verify your email address.
              </p>
              <p className="text-gray-600 text-sm">
                If you don't see the email, check your spam folder or request a new verification link.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleResendVerification} disabled={resendingVerification} className="w-full">
              {resendingVerification ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" /> Resend Verification Email
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setNeedsVerification(false)} className="w-full">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to DiceyDecisions</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
            {roomCode && (
              <div className="mt-2 text-sm font-medium text-purple-600">
                You'll be redirected to join the room after login
              </div>
            )}
            {returnTo && !roomCode && (
              <div className="mt-2 text-sm font-medium text-purple-600">You'll be redirected after login</div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || redirecting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-600">{redirecting ? "Redirecting..." : "Signing you in..."}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || redirecting}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign in
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Don't have an account?{" "}
            <Link
              href={roomCode ? `/register?return_to=/rooms/join&room_code=${roomCode}` : "/register"}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
