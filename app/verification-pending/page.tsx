"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/toast"

export default function VerificationPendingPage() {
  const [resending, setResending] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const { showToast } = useToast()

  const handleResendVerification = async () => {
    if (!email || resending) return

    setResending(true)

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

      showToast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link",
        type: "success",
      })
    } catch (error: any) {
      console.error("Resend verification error:", error)
      showToast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        type: "error",
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="bg-purple-100 rounded-full p-4 mb-6">
            <Mail className="h-12 w-12 text-purple-500" />
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-700">
              Please check your inbox at <span className="font-medium">{email}</span> and click the verification link to
              complete your registration.
            </p>
            <p className="text-gray-600 text-sm">
              If you don't see the email, check your spam folder or request a new verification link.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            // onClick={handleResendVerification}
            disabled={resending || !email}
            className="w-full"
            variant="outline"
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                {/* <RefreshCw className="mr-2 h-4 w-4" /> Resend Verification Email */}
                 <Link href="/login" className="w-full">
                    <Button variant="ghost" className="w-full">
                    Back to Login
                    </Button>
                </Link>
              </>
            )}
          </Button>
         
        </CardFooter>
      </Card>
    </div>
  )
}
