import express, { Router } from "express";
import { 
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewsByReviewerId
} from "../controllers/reviews.js";

const router: Router = express.Router();

router.post("/", createReview);

router.get("/", getReviews);
router.get("/:reviewerId", getReview);
router.get("/user/:reviewerId", getReviewsByReviewerId);

router.put("/:reviewerId", updateReview);

router.delete("/:reviewerId", deleteReview);

export const reviewsRouter = router;
