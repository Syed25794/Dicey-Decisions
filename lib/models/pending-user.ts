import mongoose, { Schema, type Document } from "mongoose"

export interface IPendingUser extends Document {
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const PendingUserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
  },
  {
    timestamps: true,
  },
)

// // Hash password before saving
// PendingUserSchema.pre("save", async function (next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified("password")) return next()

//   try {
//     // Generate a salt
//     // const salt = await bcrypt.genSalt(10)
//     // Hash the password along with the new salt
//     this.password = this.password
//     next()
//   } catch (error: any) {
//     next(error)
//   }
// })

// Add TTL index to automatically delete pending users after 24 hours
PendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 })

// Check if the model already exists to prevent overwriting
delete mongoose.models.PendingUser // Force model reload
const PendingUser = mongoose.models.PendingUser || mongoose.model<IPendingUser>("PendingUser", PendingUserSchema)

export default PendingUser
