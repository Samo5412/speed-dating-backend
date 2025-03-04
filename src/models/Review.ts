import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  reviewedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true,
  },
  round: {
    type: Number, required: true
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  showedUp: {type: Boolean},
  sameTable: {type:Boolean},
  sitNextTo: {type:Boolean},
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", ReviewSchema);

export { Review };
