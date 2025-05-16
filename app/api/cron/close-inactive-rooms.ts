import { type NextRequest, NextResponse } from "next/server"
import { closeInactiveRooms } from "@/lib/auto-close-room"

// This route can be called by a cron job or scheduled task
export async function POST(req: NextRequest) {
  try {
    // Optional: Add some basic auth for this endpoint
    const authHeader = req.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await closeInactiveRooms()

    if (result.success) {
      return NextResponse.json({
        message: `Successfully closed ${result.roomsClosed} inactive rooms`,
        roomsClosed: result.roomsClosed,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json({ error: "Failed to process cron job" }, { status: 500 })
  }
}
