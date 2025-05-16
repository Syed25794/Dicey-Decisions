import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Option from "@/lib/models/option"
import Vote from "@/lib/models/vote"
import { getAuthUser } from "@/lib/auth"
import mongoose from "mongoose"

// Submit a vote
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { roomId, optionId } = await req.json()
    const { userId } = await getAuthUser(req)

    // Validate input
    if (!roomId || !optionId) {
      return NextResponse.json({ error: "Room ID and option ID are required" }, { status: 400 })
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(roomId) || !mongoose.Types.ObjectId.isValid(optionId)) {
      return NextResponse.json({ error: "Invalid room ID or option ID" }, { status: 400 })
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

    // Check if voting is open
    if (!room.votingOpen) {
      return NextResponse.json({ error: "Voting is not open for this room" }, { status: 403 })
    }

    // Find option
    const option = await Option.findById(optionId)

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }

    // Check if option belongs to the room
    if (option.roomId.toString() !== roomId) {
      return NextResponse.json({ error: "Option does not belong to this room" }, { status: 400 })
    }

    // Check if user is voting for their own option
    if (option.submittedBy.toString() === userId) {
      return NextResponse.json({ error: "You cannot vote for your own option" }, { status: 403 })
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({ roomId, userId })

    if (existingVote) {
      // Update existing vote
      existingVote.optionId = optionId
      await existingVote.save()

      return NextResponse.json(existingVote)
    }

    // Create new vote
    const vote = await Vote.create({
      roomId,
      optionId,
      userId,
    })

    // Update room's lastActivity
    room.lastActivity = new Date()
    await room.save()

    return NextResponse.json(vote, { status: 201 })
  } catch (error: any) {
    console.error("Submit vote error:", error)
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 })
  }
}
