"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setVerifying(false)
        setError("Verification token is missing")
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Verification failed")
        }

        // Update auth context with the user data
        if (data.user) {
          setUser(data.user)
        }

        setSuccess(true)

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (error: any) {
        console.error("Verification error:", error)
        setError(error.message || "Verification failed")
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams, router, setUser])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verifying
              ? "Verifying your email address..."
              : success
                ? "Your email has been verified successfully!"
                : "There was a problem verifying your email."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {verifying ? (
            <Loader2 className="h-16 w-16 animate-spin text-purple-500" />
          ) : success ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}

          {!verifying && (
            <div className="mt-6 text-center">
              {success ? (
                <p className="text-green-600">
                  Your email has been verified. You will be redirected to the dashboard shortly.
                </p>
              ) : (
                <p className="text-red-600">{error}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!verifying && (
            <Link href={success ? "/dashboard" : "/register"}>
              <Button>{success ? "Go to Dashboard" : "Back to Registration"}</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
