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
router.get("/:reviewerId", getReview);

router.put("/:reviewerId", updateReview);

router.delete("/:reviewerId", deleteReview);

export const reviewsRouter = router;
