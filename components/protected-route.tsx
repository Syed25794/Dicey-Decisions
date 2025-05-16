"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { storeIntendedDestination } from "@/lib/intended-destination"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Only attempt redirect if not loading and no user
    if (!loading && !user && !isRedirecting) {
      setIsRedirecting(true)

      // Store the current path as the intended destination
      const searchParams = new URLSearchParams(window.location.search)
      const roomCode = searchParams.get("code")

      if (roomCode && pathname.includes("/rooms/join")) {
        // Store the room join URL as the intended destination
        storeIntendedDestination(`/rooms/join?code=${roomCode}`, roomCode)
      } else {
        // Store the current path as the intended destination
        storeIntendedDestination(window.location.pathname + window.location.search)
      }

      // Redirect to login
      router.push("/login")
    }
  }, [user, loading, router, pathname, isRedirecting])

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  // Only render children if user is authenticated
  if (!user) {
    return null
  }

  return <>{children}</>
}
