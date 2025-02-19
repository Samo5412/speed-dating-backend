import express, { Router } from "express";
import { 
  createReview,
  getReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewsByReviewerId
} from "../controllers/reviews.js";
import { verify } from "../auth/auth.js";

const router: Router = express.Router();

router.post("/", verify, createReview);

router.get("/", verify, getReviews);
router.get("/:reviewerId", verify, getReview);
router.get("/user/:reviewerId", verify, getReviewsByReviewerId);

router.put("/:reviewerId", verify, updateReview);

router.delete("/:reviewerId", verify, deleteReview);

export const reviewsRouter = router;
