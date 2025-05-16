"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PlusCircle, LogOut, Clock, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

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
  }
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { user, logout } = useAuth()
  const api = useApiClient()
  const { showToast } = useToast()
  const router = useRouter()

  const fetchRooms = async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await api.get("/api/rooms")
      setRooms(data)
    } catch (error: any) {
      console.error("Error fetching rooms:", error)
      setError(error.message || "Failed to load rooms")
      showToast({
        title: "Error",
        description: error.message || "Failed to load rooms",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRooms()
    }
  }, [user, retryCount])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      showToast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        type: "error",
      })
    }
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  const activeRooms = rooms.filter((room) => room.isOpen)
  const pastRooms = rooms.filter((room) => !room.isOpen)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-purple-600 to-pink-500 py-6">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">DiceyDecisions</h1>
              <p className="text-white/80">Welcome, {user?.name}</p>
            </div>
            <Button variant="ghost" className="text-white" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Your Decision Rooms</h2>
            <div className="flex gap-4">
              <Link href="/past-decisions">
                <Button variant="outline" className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Past Decisions
                </Button>
              </Link>
              <Link href="/rooms/create">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Room
                </Button>
              </Link>
              <Link href="/rooms/join">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Enter Room By Entering Code
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
              <p className="mt-4 text-gray-600">Loading your rooms...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-xl font-bold mt-4 mb-2">Error Loading Rooms</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={handleRetry} className="bg-purple-500 hover:bg-purple-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {activeRooms.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Active Rooms</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeRooms.map((room) => (
                      <Link href={`/rooms/${room._id}`} key={room._id}>
                        <Card className="h-full transition-transform hover:scale-105 cursor-pointer">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle>{room.title}</CardTitle>
                              <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {room.votingOpen ? "Voting Open" : "Collecting Options"}
                              </div>
                            </div>
                            <CardDescription>{room.description || "No description provided"}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-gray-500">
                              Room Code: <span className="font-mono font-bold">{room.code}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Created: {new Date(room.createdAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {pastRooms.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Past Decisions</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastRooms.map((room) => (
                      <Link href={`/rooms/${room._id}`} key={room._id}>
                        <Card className="h-full transition-transform hover:scale-105 cursor-pointer">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle>{room.title}</CardTitle>
                              <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Closed</div>
                            </div>
                            <CardDescription>{room.description || "No description provided"}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="mr-1 h-4 w-4" />
                              {new Date(room.createdAt).toLocaleDateString()}
                            </div>
                            {room.finalDecision && (
                              <div className="flex items-center text-sm text-green-600 mt-1">
                                <Check className="mr-1 h-4 w-4" />
                                Decision made
                                {room.finalDecision.tiebreaker && (
                                  <span className="ml-1">
                                    via{" "}
                                    {room.finalDecision.tiebreaker === "dice"
                                      ? "dice roll"
                                      : room.finalDecision.tiebreaker === "spinner"
                                        ? "spinner"
                                        : "coin flip"}
                                  </span>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {rooms.length === 0 && !error && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-6xl mb-4">🎲</div>
                  <h3 className="text-xl font-bold mb-2">No Rooms Yet</h3>
                  <p className="text-gray-600 mb-6">Create your first decision room to get started!</p>
                  <Link href="/rooms/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create New Room
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
