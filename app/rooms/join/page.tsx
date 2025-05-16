"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle } from "lucide-react"

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const api = useApiClient()
  const { showToast } = useToast()

  // Get room code from URL
  useEffect(() => {
    // Only proceed if user is authenticated
    if (authLoading) return

    if (!user) {
      // If not authenticated, the middleware will handle the redirect
      return
    }

    const codeFromUrl = searchParams.get("code")

    // Set room code from URL
    if (codeFromUrl) {
      setRoomCode(codeFromUrl)
      joinRoom(codeFromUrl)
    } else {
      setInitialLoading(false)
    }
  }, [searchParams, user, authLoading])

  const joinRoom = async (code: string) => {
    if (!code.trim()) {
      setError("Please enter a room code")
      setInitialLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await api.post("/api/rooms/join", { code: code.trim() })

      showToast({
        title: "Room Joined",
        description: `You've joined "${data.room.title}"`,
        type: "success",
      })

      // Redirect to the room
      router.push(`/rooms/${data.room._id}`)
    } catch (error: any) {
      console.error("Error joining room:", error)
      setError(error.message || "Failed to join room. Please check the room code and try again.")
      setInitialLoading(false)

      showToast({
        title: "Error",
        description: error.message || "Failed to join room",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    joinRoom(roomCode)
  }

  // If still in initial loading state or not authenticated, show loading spinner
  if (initialLoading || authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Join a Decision Room</CardTitle>
            <CardDescription className="text-center">
              Enter the room code to join a decision-making session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                <p className="mt-4 text-gray-600">Joining room...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">Failed to join room</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="roomCode" className="text-sm font-medium">
                  Room Code
                </label>
                <Input
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code"
                  className="font-mono uppercase"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !roomCode.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Join Room
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
