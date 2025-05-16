"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function CreateRoom() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [maxParticipants, setMaxParticipants] = useState("")
  const [loading, setLoading] = useState(false)
  const api = useApiClient()
  const { showToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = await api.post("/api/rooms", {
        title,
        description: description || undefined,
        maxParticipants: maxParticipants ? Number.parseInt(maxParticipants) : undefined,
      })

      showToast({
        title: "Room Created",
        description: "Your decision room has been created successfully!",
        type: "success",
      })

      router.push(`/rooms/${data._id}`)
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to create room",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Create a Decision Room</CardTitle>
              <CardDescription>Set up a new room for your group to make a decision together</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Room Title *
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g., Where should we go for dinner?"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about this decision"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="maxParticipants" className="block text-sm font-medium">
                    Maximum Participants (Optional)
                  </label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="2"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    placeholder="Leave blank for unlimited"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Room...
                    </>
                  ) : (
                    "Create Room"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              After creating the room, you'll get a room code to share with participants.
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
