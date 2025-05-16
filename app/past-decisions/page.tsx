"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { formatDate } from "@/lib/utils"

interface Room {
  _id: string
  title: string
  description?: string
  code: string
  createdAt: string
  isOpen: boolean
  votingOpen: boolean
  finalDecision?: {
    optionId: string
    tiebreaker?: "dice" | "spinner" | "coin"
    decidedAt: string
    optionText?: string // We'll populate this from the API
  }
}

export default function PastDecisions() {
  const [pastRooms, setPastRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { user } = useAuth()
  const api = useApiClient()
  const { showToast } = useToast()
  const router = useRouter()

  const fetchPastDecisions = async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await api.get("/api/rooms/past")
      setPastRooms(data)
    } catch (error: any) {
      console.error("Error fetching past decisions:", error)
      setError(error.message || "Failed to load past decisions")
      showToast({
        title: "Error",
        description: error.message || "Failed to load past decisions",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPastDecisions()
    }
  }, [user, retryCount])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-6">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-white">Past Decisions</h1>
            <p className="text-white/80">Review your previous decision rooms</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
              <p className="mt-4 text-gray-600">Loading your past decisions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-bold mt-4 mb-2">Error Loading Past Decisions</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={handleRetry} className="bg-purple-500 hover:bg-purple-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : pastRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-xl font-bold mb-2">No Past Decisions Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't completed any decision rooms yet. Create and finalize a decision to see it here!
              </p>
              <Link href="/rooms/create">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                  Create New Room
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastRooms.map((room) => (
                <Link href={`/rooms/${room._id}`} key={room._id}>
                  <Card className="h-full transition-transform hover:scale-105 cursor-pointer">
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                      <CardTitle>{room.title}</CardTitle>
                      <CardDescription>{room.description || "No description provided"}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {room.finalDecision ? (
                        <>
                          <div className="mb-3">
                            <h4 className="font-semibold text-gray-700">Final Decision:</h4>
                            <p className="text-lg font-bold text-purple-600">{room.finalDecision.optionText}</p>
                          </div>

                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="mr-1 h-4 w-4" />
                            Decided on: {formatDate(room.finalDecision.decidedAt)}
                          </div>

                          {room.finalDecision.tiebreaker && (
                            <div className="flex items-center text-sm text-green-600 mt-1">
                              <Check className="mr-1 h-4 w-4" />
                              Decided via{" "}
                              {room.finalDecision.tiebreaker === "dice"
                                ? "dice roll"
                                : room.finalDecision.tiebreaker === "spinner"
                                  ? "spinner"
                                  : "coin flip"}
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-500">This room was closed without a final decision.</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
