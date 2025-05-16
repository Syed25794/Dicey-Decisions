import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Room from "@/lib/models/room"
import Option from "@/lib/models/option"
import { getAuthUser } from "@/lib/auth"
import mongoose from "mongoose"

// Update an option
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { userId } = await getAuthUser(req)
    const optionId = params.id
    const { text } = await req.json()

    // Validate option ID
    if (!mongoose.Types.ObjectId.isValid(optionId)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 })
    }

    // Find option
    const option = await Option.findById(optionId)

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }

    // Check if user is the creator of the option
    if (option.submittedBy.toString() !== userId) {
      return NextResponse.json({ error: "You can only edit your own options" }, { status: 403 })
    }

    // Find room to check if voting has started
    const room = await Room.findById(option.roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Check if voting has started
    if (room.votingOpen) {
      return NextResponse.json({ error: "Cannot edit options after voting has started" }, { status: 403 })
    }

    // Update option
    option.text = text
    await option.save()

    // Update room's lastActivity
    room.lastActivity = new Date()
    await room.save()

    // Populate submittedBy
    await option.populate("submittedBy", "name")

    return NextResponse.json(option)
  } catch (error: any) {
    console.error("Update option error:", error)
    return NextResponse.json({ error: "Failed to update option" }, { status: 500 })
  }
}

// Delete an option
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    const { userId } = await getAuthUser(req)
    const optionId = params.id

    // Validate option ID
    if (!mongoose.Types.ObjectId.isValid(optionId)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 })
    }

    // Find option
    const option = await Option.findById(optionId)

    if (!option) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 })
    }

    // Check if user is the creator of the option
    if (option.submittedBy.toString() !== userId) {
      return NextResponse.json({ error: "You can only delete your own options" }, { status: 403 })
    }

    // Find room to check if voting has started
    const room = await Room.findById(option.roomId)

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 })
    }

    // Check if voting has started
    if (room.votingOpen) {
      return NextResponse.json({ error: "Cannot delete options after voting has started" }, { status: 403 })
    }

    // Delete option
    await Option.findByIdAndDelete(optionId)

    // Update room's lastActivity
    room.lastActivity = new Date()
    await room.save()

    return NextResponse.json({ message: "Option deleted successfully" })
  } catch (error: any) {
    console.error("Delete option error:", error)
    return NextResponse.json({ error: "Failed to delete option" }, { status: 500 })
  }
}
