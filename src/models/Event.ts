import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  ],
  startDateTime: { type: Date },
  endDateTime: { type: Date },
  location: { type: String },
  description: { type: String },
  maximumParticipants: { type: Number },
  isEventActive: { type: Boolean, default: false },
  registrationDeadline: { type: Date },
  nextRound: {
    roundNumber: { type: Number, default: 1 },
    isRoundActive: { type: Boolean, default: false },
    startTime: { type: Date },
    endTime: { type: Date },
  },
});

const Event = mongoose.model("Event", EventSchema);

export { Event };
