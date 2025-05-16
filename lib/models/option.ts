import mongoose, { Schema, type Document } from "mongoose"

export interface IOption extends Document {
  roomId: mongoose.Types.ObjectId
  text: string
  submittedBy: mongoose.Types.ObjectId
  createdAt: Date
}

const OptionSchema = new Schema<IOption>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Option || mongoose.model<IOption>("Option", OptionSchema)
