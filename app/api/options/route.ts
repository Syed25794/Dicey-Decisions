import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Option from "@/lib/models/option"
import { getAuthUser } from "@/lib/auth"
import mongoose from "mongoose"

// Create a new option
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { roomId, text } = await req.json()
    const { userId } = await getAuthUser(req)

    // Validate input
    if (!roomId || !text) {
      return NextResponse.json({ error: "Room ID and text are required" }, { status: 400 })
    }

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

    // Check if voting has started
    if (room.votingOpen) {
      return NextResponse.json({ error: "Cannot add options after voting has started" }, { status: 403 })
    }

    // Create option
    const option = await Option.create({
      roomId,
      text,
      submittedBy: userId,
    })

    // Update room's lastActivity
    room.lastActivity = new Date()
    await room.save()

    // Populate submittedBy
    await option.populate("submittedBy", "name")

    return NextResponse.json(option, { status: 201 })
  } catch (error: any) {
    console.error("Create option error:", error)
    return NextResponse.json({ error: "Failed to create option" }, { status: 500 })
  }
}
