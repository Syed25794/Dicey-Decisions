import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Option from "@/lib/models/option"
import { verifyToken, getTokens } from "@/lib/auth"

// Get all past (closed) rooms for the current user
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

    // Find closed rooms where user is a participant
    const rooms = await Room.find({
      participants: userId,
      isOpen: false,
    })
      .sort({ "finalDecision.decidedAt": -1 })
      .populate("creatorId", "name email")

    // For each room with a final decision, get the option text
    const roomsWithOptionText = await Promise.all(
      rooms.map(async (room) => {
        const roomObj = room.toObject()

        if (roomObj.finalDecision && roomObj.finalDecision.optionId) {
          const option = await Option.findById(roomObj.finalDecision.optionId)
          if (option) {
            roomObj.finalDecision.optionText = option.text
          }
        }

        return roomObj
      }),
    )

    return NextResponse.json(roomsWithOptionText)
  } catch (error: any) {
    console.error("Get past rooms error:", error)
    return NextResponse.json({ error: "Failed to get past rooms" }, { status: 500 })
  }
}
