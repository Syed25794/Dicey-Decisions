import mongoose, { Schema, type Document } from "mongoose"
import { nanoid } from "nanoid"

export interface IRoom extends Document {
  title: string
  description?: string
  maxParticipants?: number
  code: string
  creatorId: mongoose.Types.ObjectId
  participants: mongoose.Types.ObjectId[]
  isOpen: boolean
  votingOpen: boolean
  createdAt: Date
  lastActivity: Date
  finalDecision?: {
    optionId: mongoose.Types.ObjectId
    tiebreaker?: "dice" | "spinner" | "coin"
    decidedAt: Date
  }
}

const RoomSchema = new Schema<IRoom>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  maxParticipants: {
    type: Number,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(6).toUpperCase(),
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isOpen: {
    type: Boolean,
    default: true,
  },
  votingOpen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  finalDecision: {
    optionId: {
      type: Schema.Types.ObjectId,
      ref: "Option",
    },
    tiebreaker: {
      type: String,
      enum: ["dice", "spinner", "coin"],
    },
    decidedAt: {
      type: Date,
    },
  },
})

export default mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema)
