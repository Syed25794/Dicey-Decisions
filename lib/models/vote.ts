import mongoose, { Schema, type Document } from "mongoose"

export interface IVote extends Document {
  roomId: mongoose.Types.ObjectId
  optionId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  createdAt: Date
}

const VoteSchema = new Schema<IVote>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  optionId: {
    type: Schema.Types.ObjectId,
    ref: "Option",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Ensure a user can only vote once per room
VoteSchema.index({ roomId: 1, userId: 1 }, { unique: true })

export default mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema)
