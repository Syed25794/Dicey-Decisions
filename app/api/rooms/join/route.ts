import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import { getAuthUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    // Get the room code from the request body
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: "Room code is required" }, { status: 400 })
    }

    // Get authenticated user
    let userId
    try {
      const user = await getAuthUser(req)
      userId = user.userId
    } catch (error) {
      console.error("Authentication error:", error)
      return NextResponse.json({ error: "Authentication failed. Please log in again." }, { status: 401 })
    }

    // Find the room by code
    const room = await Room.findOne({ code: code.toUpperCase() })

    if (!room) {
      return NextResponse.json({ error: "Room not found. Please check the code and try again." }, { status: 404 })
    }

    // Check if the room is open
    if (!room.isOpen) {
      return NextResponse.json({ error: "This room is closed and not accepting new participants." }, { status: 400 })
    }

    // Check if user is already a participant
    if (!room.participants.includes(userId)) {
      // Add user to participants
      room.participants.push(userId)
      room.lastActivity = new Date()
      await room.save()
    }

    return NextResponse.json({
      room,
      message: "Successfully joined the room",
    })
  } catch (error: any) {
    console.error("Join room error:", error)
    return NextResponse.json(
      {
        error: "Failed to join room. Please try again later.",
      },
      { status: 500 },
    )
  }
}
