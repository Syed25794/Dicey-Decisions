"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { register, loading, error, clearError, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get return_to and room_code from URL parameters
  useEffect(() => {
    const returnToParam = searchParams.get("return_to")
    const roomCodeParam = searchParams.get("room_code")

    console.log("🔍 Register page received params:", { returnToParam, roomCodeParam })

    if (returnToParam) {
      setReturnTo(returnToParam)
      console.log("📝 Return path set:", returnToParam)
    }

    if (roomCodeParam) {
      setRoomCode(roomCodeParam)
      console.log("🔑 Room code set:", roomCodeParam)
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
        if (returnTo) {
          // Decode the URL if it's encoded
          const decodedReturnTo = decodeURIComponent(returnTo)
          console.log(`🔄 Decoded return path: ${decodedReturnTo}`)

          if (roomCode && decodedReturnTo === "/rooms/join") {
            const redirectUrl = `/rooms/join?code=${roomCode}`
            console.log(`🔄 Redirecting to room join: ${redirectUrl}`)
            window.location.href = redirectUrl // Use direct navigation instead of router
          } else {
            console.log(`🔄 Redirecting to: ${decodedReturnTo}`)
            window.location.href = decodedReturnTo // Use direct navigation instead of router
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
  }, [user, loading, returnTo, roomCode, router, redirecting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setPasswordError(null)
    setSubmitting(true)

    if (!name || !email || !password || !confirmPassword) {
      setSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      setSubmitting(false)
      return
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      setSubmitting(false)
      return
    }

    console.log("🔐 Submitting registration")
    await register(name, email, password)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-200 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-2xl bg-white">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-center text-purple-700">Create an account</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Enter your details to create a DiceyDecisions account
            {roomCode && (
              <div className="mt-2 text-sm font-medium text-purple-600">
                You'll be redirected to join the room after registration
              </div>
            )}
            {returnTo && !roomCode && (
              <div className="mt-2 text-sm font-medium text-purple-600">You'll be redirected after registration</div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || redirecting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
              <p className="text-gray-600">{redirecting ? "Redirecting..." : "Creating your account..."}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                />
                {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
              </div>
              <Button
                type="submit"
                className={cn(
                  "w-full py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 transition text-white flex items-center justify-center",
                  (loading || submitting) && "opacity-70 cursor-not-allowed"
                )}
                disabled={loading || redirecting || submitting}
              >
                {(loading || submitting) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create account
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{" "}
            <Link
              href={roomCode ? `/login?return_to=/rooms/join&room_code=${roomCode}` : "/login"}
              className="text-purple-600 hover:text-purple-500 font-medium transition"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
