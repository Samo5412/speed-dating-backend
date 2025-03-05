import mongoose from "mongoose";

const ALLOWED_INTERESTS = [
  "coding",
  "hiking",
  "gaming",
  "cooking",
  "photography",
  "music",
  "reading",
  "travel",
  "sports",
] as const;

const ALLOWED_GENDERS = ["man", "woman"] as const;

const UserProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ALLOWED_GENDERS }, // TODO: Should be required?
  phoneNumber: { type: String },
  occupation: { type: String },
  avatarUrl: { type: String },
  bio: { type: String },
  interests: [
    {
      type: String,
    },
  ],
  lookingFor: {
    ageRange: { type: String },
    relationshipType: { type: String },
  },
  eventPreference: { type: String },
});

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export { UserProfile };
