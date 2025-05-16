import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  name: string
  email: string
  password: string
  isVerified: boolean
  verifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema(
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
// UserSchema.pre("save", async function (next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified("password")) return next()

//   try {
//     // Generate a salt
//     // const salt = await bcrypt.genSalt(10)
//     // Hash the password along with the new salt
//     // this.password = await bcrypt.hash(this.password, salt)
//     this.password = this.password
//     next()
//   } catch (error: any) {
//     next(error)
//   }
// })

// Method to compare password for login
// UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password)
// }

// Check if the model already exists to prevent overwriting
delete mongoose.models.User // Force model reload
const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
