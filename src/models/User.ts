import mongoose from "mongoose";

export const ALLOWED_ROLES = ["organizer", "participant"] as const;

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  salt: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ALLOWED_ROLES,
    required: true,
    index: true,
  },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
  sharedContacts: [
    {
      // contact references User B (not this user).
      contact: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      // status represents User A's (this user's) response.
      status: {
        type: String,
        enum: ["pending", "accepted", "blocked"],
        default: "pending",
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  notifications: [
    {
      message: { type: String, required: true },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  dateMatches: [
    {
      event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
      round: { type: Number, required: true },
      
      // participant references User B (not this user).
      participant: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

export { User };
