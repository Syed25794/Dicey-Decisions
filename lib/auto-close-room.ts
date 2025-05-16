import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"

// Function to close inactive rooms
export async function closeInactiveRooms() {
  try {
    await dbConnect()

    // Calculate the timestamp for 30 minutes ago
    const thirtyMinutesAgo = new Date()
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30)

    // Find and update rooms that are open but inactive for 30+ minutes
    const result = await Room.updateMany(
      {
        isOpen: true,
        lastActivity: { $lt: thirtyMinutesAgo },
      },
      {
        $set: {
          isOpen: false,
          votingOpen: false,
        },
      },
    )

    return {
      success: true,
      roomsClosed: result.modifiedCount,
    }
  } catch (error) {
    console.error("Error closing inactive rooms:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
