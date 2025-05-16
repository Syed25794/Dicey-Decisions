import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Option from "@/lib/models/option"
import Vote from "@/lib/models/vote"
import { getAuthUser } from "@/lib/auth"
import mongoose from "mongoose"

// Get a specific room
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  
  
  try {
    await dbConnect()
    
    const { userId } = await getAuthUser(req)
    const { id } = await context.params;
    const roomId = id

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

    // Get options for this room
    const options = await Option.find({ roomId }).populate("submittedBy", "name")

    // Get votes if voting is closed
    let votes = []
    let userVote = null

    if (!room.isOpen || !room.votingOpen) {
      votes = await Vote.find({ roomId })
    } else {
      // If voting is open, only get the user's vote
      userVote = await Vote.findOne({ roomId, userId })
    }

    return NextResponse.json({
      room,
      options,
      votes: !room.votingOpen ? votes : [],
      userVote,
    })
  } catch (error: any) {
    console.error("Get room error:", error)
    return NextResponse.json({ error: "Failed to get room" }, { status: 500 })
  }
}

// Update a room
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  
  try {
    await dbConnect()
    
    const { userId } = await getAuthUser(req)
    const { id } = await context.params;
    const roomId = id
    const updates = await req.json()

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
      return NextResponse.json({ error: "Only the room creator can update the room" }, { status: 403 })
    }

    // Update allowed fields
    const allowedUpdates = ["title", "description", "maxParticipants", "isOpen", "votingOpen"]
    const updateData: any = {}

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key]
      }
    })

    // Update lastActivity
    updateData.lastActivity = new Date()

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, { new: true })

    return NextResponse.json(updatedRoom)
  } catch (error: any) {
    console.error("Update room error:", error)
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 })
  }
}

// Delete a room
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  
  try {
    await dbConnect()
    
    const { userId } = await getAuthUser(req)
    const { id } = await context.params;
    const roomId = id

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
      return NextResponse.json({ error: "Only the room creator can delete the room" }, { status: 403 })
    }

    // Delete room and related data
    await Promise.all([Room.findByIdAndDelete(roomId), Option.deleteMany({ roomId }), Vote.deleteMany({ roomId })])

    return NextResponse.json({ message: "Room deleted successfully" })
  } catch (error: any) {
    console.error("Delete room error:", error)
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 })
  }
}
