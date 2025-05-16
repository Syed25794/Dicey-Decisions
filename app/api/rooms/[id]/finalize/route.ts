import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Option from "@/lib/models/option"
import Vote from "@/lib/models/vote"
import { getAuthUser } from "@/lib/auth"
import mongoose from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { userId } = await getAuthUser(req)
    const roomId = params.id
    const { tiebreaker } = await req.json()

    // Validate room ID
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 })
    }

    // Find room
    const room = await Room.findById(roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Check if user is the creator
    if (room.creatorId.toString() !== userId) {
      return NextResponse.json({ error: "Only the room creator can finalize the decision" }, { status: 403 })
    }

    // Get all votes for this room
    const votes = await Vote.find({ roomId })

    if (votes.length === 0) {
      return NextResponse.json({ error: "No votes have been cast" }, { status: 400 })
    }

    // Count votes for each option
    const voteCounts = votes.reduce((acc: Record<string, number>, vote) => {
      const optionId = vote.optionId.toString()
      acc[optionId] = (acc[optionId] || 0) + 1
      return acc
    }, {})

    // Find the option(s) with the most votes
    const maxVotes = Math.max(...Object.values(voteCounts))
    const winningOptionIds = Object.keys(voteCounts).filter((optionId) => voteCounts[optionId] === maxVotes)

    let winningOptionId

    // If there's a tie and a tiebreaker is provided
    if (winningOptionIds.length > 1 && tiebreaker) {
      // Use random selection for the tiebreaker
      const randomIndex = Math.floor(Math.random() * winningOptionIds.length)
      winningOptionId = winningOptionIds[randomIndex]
    } else {
      // If no tie or no tiebreaker, use the first winning option
      winningOptionId = winningOptionIds[0]
    }

    // Update room with final decision
    room.isOpen = false
    room.votingOpen = false
    room.finalDecision = {
      optionId: winningOptionId,
      tiebreaker: winningOptionIds.length > 1 ? tiebreaker : undefined,
      decidedAt: new Date(),
    }
    room.lastActivity = new Date()

    await room.save()

    // Get the winning option details
    const winningOption = await Option.findById(winningOptionId).populate("submittedBy", "name")

    return NextResponse.json({
      room,
      winningOption,
      isTie: winningOptionIds.length > 1,
      tiebreaker: winningOptionIds.length > 1 ? tiebreaker : null,
    })
  } catch (error: any) {
    console.error("Finalize decision error:", error)
    return NextResponse.json({ error: "Failed to finalize decision" }, { status: 500 })
  }
}
