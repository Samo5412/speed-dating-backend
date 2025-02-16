import express, { Router } from "express";
import { 
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview
} from "../controllers/reviews.js";

const router: Router = express.Router();

router.post("/", createReview);

router.get("/", getReviews);
router.get("/:reviewId", getReview);

router.put("/:reviewId", updateReview);

router.delete("/:reviewId", deleteReview);

export const reviewsRouter = router;
