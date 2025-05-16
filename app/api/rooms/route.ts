import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import { verifyToken, getTokens } from "@/lib/auth"

// Create a new room
export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const { title, description, maxParticipants } = await req.json()

    // Get user ID from token (either from header or cookie)
    let userId: string

    // Try to get from Authorization header first
    const authHeader = req.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      const payload = verifyToken(token)
      userId = payload.userId
    } else {
      // If no Authorization header, try cookies
      const { accessToken } = await getTokens()
      if (!accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }

      const payload = verifyToken(accessToken)
      userId = payload.userId
    }

    // Validate input
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create room
    const room = await Room.create({
      title,
      description,
      maxParticipants,
      creatorId: userId,
      participants: [userId],
    })

    return NextResponse.json(room, { status: 201 })
  } catch (error: any) {
    console.error("Create room error:", error)
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 })
  }
}

// Get all rooms for the current user
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    // Get user ID from token (either from header or cookie)
    let userId: string

    // Try to get from Authorization header first
    const authHeader = req.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]
      const payload = verifyToken(token)
      userId = payload.userId
    } else {
      // If no Authorization header, try cookies
      const { accessToken } = await getTokens()
      if (!accessToken) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }

      const payload = verifyToken(accessToken)
      userId = payload.userId
    }

    // Find rooms where user is a participant
    const rooms = await Room.find({ participants: userId }).sort({ createdAt: -1 }).populate("creatorId", "name email")

    return NextResponse.json(rooms)
  } catch (error: any) {
    console.error("Get rooms error:", error)
    return NextResponse.json({ error: "Failed to get rooms" }, { status: 500 })
  }
}
