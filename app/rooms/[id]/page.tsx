"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useApiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, Copy, Check, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Tiebreaker } from "@/components/tiebreakers/tiebreaker"
import { ProtectedRoute } from "@/components/protected-route"
import { DeleteRoomDialog } from "@/components/delete-room-dialog"
import { GameShowReveal } from "@/components/game-show-reveal"
import Timer from "@/components/timer"

interface Room {
  _id: string
  title: string
  description?: string
  code: string
  creatorId: string
  participants: string[]
  isOpen: boolean
  votingOpen: boolean
  createdAt: string
  finalDecision?: {
    optionId: string
    tiebreaker?: "dice" | "spinner" | "coin"
    decidedAt: string
  }
}

interface Option {
  _id: string
  text: string
  submittedBy: {
    _id: string
    name: string
  }
  roomId: string
  createdAt: string
}

interface Vote {
  _id: string
  roomId: string
  optionId: string
  userId: string
  createdAt: string
}

interface VoteCounts {
  [optionId: string]: number
}

export default function RoomDetail({ params: asyncParams }: { params: Promise<{ id: string }> }) {
  const { id } = use(asyncParams)
  const [room, setRoom] = useState<Room | null>(null)
  const [options, setOptions] = useState<Option[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({})
  const [userVote, setUserVote] = useState<Vote | null>(null)
  const [loading, setLoading] = useState(true)
  const [newOption, setNewOption] = useState("")
  const [editingOption, setEditingOption] = useState<Option | null>(null)
  const [editText, setEditText] = useState("")
  const [submittingOption, setSubmittingOption] = useState(false)
  const [submittingVote, setSubmittingVote] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [showTiebreaker, setShowTiebreaker] = useState(false)
  const [tiebreaker, setTiebreaker] = useState<"dice" | "spinner" | "coin">("dice")
  const [winningOption, setWinningOption] = useState<Option | null>(null)
  const [isTie, setIsTie] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const api = useApiClient()
  const { showToast } = useToast()
  const router = useRouter()

  const isCreator = room?.creatorId === user?.id
  const canVote = room?.votingOpen && !userVote && options.some((opt) => opt.submittedBy._id !== user?.id)
  const canSubmitOption = room?.isOpen && !room?.votingOpen
  const canSeeResults = !room?.votingOpen || room?.isOpen === false

  // Fetch room data
  const fetchRoom = async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await api.get(`/api/rooms/${id}`)
      setRoom(data.room)
      setOptions(data.options)

      if (data.votes && data.votes.length > 0) {
        setVotes(data.votes)
      }

      if (data.userVote) {
        setUserVote(data.userVote)
        setSelectedOptionId(data.userVote.optionId)
      }

      // If room is closed and has a final decision, fetch the winning option
      if (data.room.finalDecision) {
        const winningOpt = data.options.find((opt: Option) => opt._id === data.room.finalDecision.optionId)
        setWinningOption(winningOpt || null)
      }
    } catch (error: any) {
      console.error("Error fetching room:", error)
      setError(error.message || "Failed to load room")
      showToast({
        title: "Error",
        description: error.message || "Failed to load room",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return // Don't fetch if not authenticated

    if (user) {
      fetchRoom()
    }
  }, [id, user])

  // Poll for updates
  useEffect(() => {
    if (!room || !user) return

    const pollInterval = setInterval(async () => {
      try {
        // Poll for vote counts if voting is open
        if (room.votingOpen) {
          const voteData = await api.get(`/api/votes/count/${room._id}`)

          if (voteData.voteCounts) {
            setVoteCounts(voteData.voteCounts)
          }
        }

        // Check for room updates
        const roomData = await api.get(`/api/rooms/${id}`)

        // Update room state if something changed
        if (
          roomData.room.isOpen !== room.isOpen ||
          roomData.room.votingOpen !== room.votingOpen ||
          roomData.options.length !== options.length
        ) {
          setRoom(roomData.room)
          setOptions(roomData.options)

          if (roomData.votes && roomData.votes.length > 0) {
            setVotes(roomData.votes)
          }

          if (roomData.userVote) {
            setUserVote(roomData.userVote)
            setSelectedOptionId(roomData.userVote.optionId)
          }

          // If room is closed and has a final decision, fetch the winning option
          if (roomData.room.finalDecision) {
            const winningOpt = roomData.options.find((opt: Option) => opt._id === roomData.room.finalDecision.optionId)
            setWinningOption(winningOpt || null)
          }

          // Show toast for state changes
          if (roomData.room.votingOpen && !room.votingOpen) {
            showToast({
              title: "Voting Started",
              description: "Voting has been opened for this room",
              type: "info",
            })
          } else if (!roomData.room.votingOpen && room.votingOpen) {
            showToast({
              title: "Voting Closed",
              description: "Voting has been closed for this room",
              type: "info",
            })
          } else if (!roomData.room.isOpen && room.isOpen) {
            showToast({
              title: "Room Closed",
              description: "This decision room has been closed",
              type: "info",
            })
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
      }
    }, 10000) // Poll every 5 seconds

    return () => clearInterval(pollInterval)
  }, [room, options, user])

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOption.trim()) return

    setSubmittingOption(true)

    try {
      const data = await api.post("/api/options", {
        roomId: room?._id,
        text: newOption.trim(),
      })

      setOptions([...options, data])
      setNewOption("")
      
      showToast({
        title: "Option Added",
        description: "Your option has been added successfully",
        type: "success",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to add option",
        type: "error",
      })
    } finally {
      setSubmittingOption(false)
    }
  }

  const handleEditOption = async (option: Option) => {
    setEditingOption(option)
    setEditText(option.text)
    
  }

  const handleSaveEdit = async () => {
    if (!editingOption || !editText.trim()) return

    setSubmittingOption(true)

    try {
      const data = await api.patch(`/api/options/${editingOption._id}`, {
        text: editText.trim(),
      })

      setOptions(options.map((opt) => (opt._id === editingOption._id ? data : opt)))

      setEditingOption(null)
      setEditText("")
      


      showToast({
        title: "Option Updated",
        description: "Your option has been updated successfully",
        type: "success",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to update option",
        type: "error",
      })
    } finally {
      setSubmittingOption(false)
    }
  }

  const handleDeleteOption = async (optionId: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return

    try {
      await api.delete(`/api/options/${optionId}`)

      setOptions(options.filter((opt) => opt._id !== optionId))
      


      showToast({
        title: "Option Deleted",
        description: "Your option has been deleted successfully",
        type: "success",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to delete option",
        type: "error",
      })
    }
  }

  const handleVote = async () => {
    if (!selectedOptionId) return

    setSubmittingVote(true)

    try {
      const data = await api.post("/api/votes", {
        roomId: room?._id,
        optionId: selectedOptionId,
      })

      setUserVote(data)
      


      showToast({
        title: "Vote Submitted",
        description: "Your vote has been recorded",
        type: "success",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to submit vote",
        type: "error",
      })
    } finally {
      setSubmittingVote(false)
    }
  }

  const handleToggleVoting = async () => {
    if (!room) return

    try {
      const data = await api.patch(`/api/rooms/${room._id}`, {
        votingOpen: !room.votingOpen,
      })

      setRoom(data)
    

      showToast({
        title: room.votingOpen ? "Voting Closed" : "Voting Started",
        description: room.votingOpen ? "Voting has been closed for this room" : "Voting has been opened for this room",
        type: "info",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to update room",
        type: "error",
      })
    }
  }

  const handleCloseRoom = async () => {
    if (!room) return
    if (!confirm("Are you sure you want to close this room?")) return

    try {
      const data = await api.patch(`/api/rooms/${room._id}`, {
        isOpen: false,
        votingOpen: false,
      })

      setRoom(data)
      


      showToast({
        title: "Room Closed",
        description: "This decision room has been closed",
        type: "info",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to close room",
        type: "error",
      })
    }
  }

  const handleFinalizeDecision = async () => {
    if (!room) return

    try {
      // First, get the vote counts
      const voteData = await api.get(`/api/votes/count/${room._id}`)

      if (!voteData.voteCounts) {
        showToast({
          title: "Error",
          description: "No votes have been cast yet",
          type: "error",
        })
        return
      }
    


      // Find the option(s) with the most votes
      const maxVotes = Math.max(...Object.values(voteData.voteCounts as number))
      const winningOptionIds = Object.keys(voteData.voteCounts).filter(
        (optionId) => voteData.voteCounts[optionId] === maxVotes,
      )

      // If there's a tie, show the tiebreaker UI
      if (winningOptionIds.length > 1) {
        setIsTie(true)
        setShowTiebreaker(true)
      } else {
        // If no tie, finalize with the winning option
        const data = await api.post(`/api/rooms/${room._id}/finalize`, {})

        const winningOpt = options.find((opt) => opt._id === data.winningOption._id)

        setWinningOption(winningOpt || null)
        setRoom(data.room)

        showToast({
          title: "Decision Finalized",
          description: `The winning option is: ${data.winningOption.text}`,
          type: "success",
        })
      }
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to finalize decision",
        type: "error",
      })
    }
  }

  const handleTiebreakerComplete = async () => {
    if (!room) return

    try {
      // Finalize with the selected tiebreaker
      const data = await api.post(`/api/rooms/${room._id}/finalize`, {
        tiebreaker,
      })

      setShowTiebreaker(false)
    


      const winningOpt = options.find((opt) => opt._id === data.winningOption._id)

      setWinningOption(winningOpt || null)
      setRoom(data.room)

      showToast({
        title: "Decision Finalized",
        description: `The winning option is: ${data.winningOption.text}`,
        type: "success",
      })
    } catch (error: any) {
      showToast({
        title: "Error",
        description: error.message || "Failed to finalize decision",
        type: "error",
      })
    }
  }

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/rooms/join?code=${room?.code}`
    navigator.clipboard.writeText(inviteLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)

    showToast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
      type: "success",
    })
  }

  // Randomize options order for voting
  const displayOptions = room?.votingOpen ? [...options].sort(() => Math.random() - 0.5) : options

  const handleRetry = () => {
    fetchRoom()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
                <p className="mt-4 text-gray-600">Loading room...</p>
              </div>
            ) : error ? (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                    Error
                  </CardTitle>
                  <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    There was a problem loading this room. Please try again or return to the dashboard.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleRetry} className="bg-purple-500 hover:bg-purple-600">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Link href="/dashboard">
                      <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : !room ? (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Room Not Found</CardTitle>
                  <CardDescription>
                    The room you're looking for doesn't exist or you don't have access to it.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full">Back to Dashboard</Button>
                  </Link>
                </CardFooter>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{room.title}</CardTitle>
                      {room.description && <CardDescription className="mt-2">{room.description}</CardDescription>}
                    </div>
                    <div
                      className={`px-3 py-1 text-sm rounded-full ${
                        !room.isOpen
                          ? "bg-gray-100 text-gray-800"
                          : room.votingOpen
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {!room.isOpen ? "Closed" : room.votingOpen ? "Voting Open" : "Collecting Options"}
                    </div>
                  </div>
                  {/* {!roomActive  && <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                      <Timer seconds={1800} key={1} setTimerEnd={setTimerEnd} setTimerStart={setTimerStart} />
                  </div>} */}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500">
                        Room Code: <span className="font-mono font-bold">{room.code}</span>
                      </p>
                      <p className="text-sm text-gray-500">Created: {new Date(room.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyInviteLink}
                        className="flex items-center"
                        disabled={!room.isOpen}
                      >
                        {copySuccess ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                        {copySuccess ? "Copied!" : "Copy Invite Link"}
                      </Button>
                      {isCreator && (
                        <>
                          {room.isOpen && (
                            <>
                              <Button
                                variant={room.votingOpen ? "outline" : "default"}
                                size="sm"
                                onClick={handleToggleVoting}
                                className={room.votingOpen ? "" : "bg-blue-500 hover:bg-blue-600"}
                              >
                                {room.votingOpen ? "Close Voting" : "Start Voting"}
                              </Button>
                              {!room.votingOpen && (
                                <Button variant="outline" size="sm" onClick={handleCloseRoom} className="text-red-500">
                                  Close Room
                                </Button>
                              )}
                              {room.votingOpen && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={handleFinalizeDecision}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  Finalize Decision
                                </Button>
                              )}
                            </>
                          )}
                          <DeleteRoomDialog roomId={room._id} roomTitle={room.title} />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Show tiebreaker UI if there's a tie */}
                  {showTiebreaker && (
                    <div className="mb-8">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">It's a Tie!</h3>
                        <p className="text-gray-600">Choose a tiebreaker method:</p>
                      </div>
                      <div className="flex flex-wrap gap-4 mb-4">
                        <Button
                          variant={tiebreaker === "dice" ? "default" : "outline"}
                          onClick={() => setTiebreaker("dice")}
                          className={tiebreaker === "dice" ? "bg-purple-500 hover:bg-purple-600" : ""}
                        >
                          🎲 Dice Roll
                        </Button>
                        <Button
                          variant={tiebreaker === "spinner" ? "default" : "outline"}
                          onClick={() => setTiebreaker("spinner")}
                          className={tiebreaker === "spinner" ? "bg-purple-500 hover:bg-purple-600" : ""}
                        >
                          🎡 Spinner
                        </Button>
                        <Button
                          variant={tiebreaker === "coin" ? "default" : "outline"}
                          onClick={() => setTiebreaker("coin")}
                          className={tiebreaker === "coin" ? "bg-purple-500 hover:bg-purple-600" : ""}
                        >
                          🪙 Coin Flip
                        </Button>
                      </div>
                      <Tiebreaker type={tiebreaker} onComplete={handleTiebreakerComplete} />
                    </div>
                  )}

                  {/* Show winning option if decision is finalized */}
                  {!room.isOpen && room.finalDecision && winningOption && (
                    <div className="mb-8">
                      <GameShowReveal winningOption={winningOption.text} tiebreaker={room.finalDecision.tiebreaker} />
                    </div>
                  )}

                  {/* Option submission form */}
                  {canSubmitOption && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Submit an Option</h3>
                      <form onSubmit={handleAddOption} className="flex gap-2">
                        <Input
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Enter your option..."
                          className="flex-1"
                        />
                        <Button type="submit" disabled={submittingOption || !newOption.trim()}>
                          {submittingOption ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Options list */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">
                      {room.votingOpen ? "Vote for an Option" : "Submitted Options"}
                    </h3>

                    {options.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No options submitted yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {displayOptions.map((option) => (
                          <div
                            key={option._id}
                            className={`p-4 border rounded-lg ${
                              userVote && userVote.optionId === option._id
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            } ${
                              room.votingOpen && canVote && selectedOptionId === option._id
                                ? "border-blue-500 bg-blue-50"
                                : ""
                            }`}
                          >
                            {editingOption && editingOption._id === option._id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={handleSaveEdit}
                                  disabled={submittingOption || !editText.trim()}
                                  size="sm"
                                >
                                  {submittingOption ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingOption(null)}
                                  size="sm"
                                  className="text-gray-500"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{option.text}</p>
                                  <p className="text-sm text-gray-500">
                                    Submitted by: {option.submittedBy.name}{" "}
                                    {option.submittedBy._id === user?.id && "(You)"}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {/* Show vote count if results are visible */}
                                  {canSeeResults && voteCounts[option._id] !== undefined && (
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm font-medium mr-2">
                                      {voteCounts[option._id]} vote{voteCounts[option._id] !== 1 ? "s" : ""}
                                    </span>
                                  )}

                                  {/* Edit/Delete buttons for user's own options */}
                                  {option.submittedBy._id === user?.id && !room.votingOpen && room.isOpen && (
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditOption(option)}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteOption(option._id)}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Voting UI */}
                            {room.votingOpen && canVote && option.submittedBy._id !== user?.id && (
                              <div className="mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`w-full ${
                                    selectedOptionId === option._id ? "border-blue-500 bg-blue-50" : ""
                                  }`}
                                  onClick={() => setSelectedOptionId(option._id)}
                                >
                                  {selectedOptionId === option._id ? "Selected" : "Select"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Vote submission button */}
                        {room.votingOpen && canVote && (
                          <div className="mt-4">
                            <Button
                              onClick={handleVote}
                              disabled={submittingVote || !selectedOptionId}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                            >
                              {submittingVote ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Vote...
                                </>
                              ) : (
                                "Submit Vote"
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Already voted message */}
                        {room.votingOpen && userVote && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                            <p className="text-green-700">
                              You've voted! Results will be revealed when voting is closed.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
