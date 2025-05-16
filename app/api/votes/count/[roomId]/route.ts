import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Vote from "@/lib/models/vote"
import { getAuthUser } from "@/lib/auth"
import mongoose from "mongoose"

  export async function GET(req: NextRequest, context: { params: { roomId: string } }) {
    
    try {
      await dbConnect()
      
      const { userId } = await getAuthUser(req)
      const { roomId } = await context.params;

    // Validate room ID
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return NextResponse.json({ error: "Invalid room ID" }, { status: 400 })
    }

    // Find room
    const room = await Room.findById(roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Check if user is a participant
    if (!room.participants.includes(userId)) {
      return NextResponse.json({ error: "You are not a participant in this room" }, { status: 403 })
    }

    // Check if voting is closed or if user is the creator
    const canSeeResults = !room.votingOpen || room.creatorId.toString() === userId

    if (!canSeeResults) {
      // If voting is still open and user is not the creator,
      // just return the count of votes
      const voteCount = await Vote.countDocuments({ roomId })
      const userVoted = await Vote.exists({ roomId, userId })

      return NextResponse.json({
        totalVotes: voteCount,
        userVoted: !!userVoted,
        voteCounts: null,
      })
    }

    // Get all votes for this room
    const votes = await Vote.find({ roomId })

    // Count votes for each option
    const voteCounts = votes.reduce((acc: Record<string, number>, vote) => {
      const optionId = vote.optionId.toString()
      acc[optionId] = (acc[optionId] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      totalVotes: votes.length,
      userVoted: votes.some((vote) => vote.userId.toString() === userId),
      voteCounts,
    })
  } catch (error: any) {
    console.error("Get vote counts error:", error)
    return NextResponse.json({ error: "Failed to get vote counts" }, { status: 500 })
  }
}
