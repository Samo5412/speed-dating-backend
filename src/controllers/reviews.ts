import { Request, Response } from "express";
import { Review } from "../models/Review.js";
import { MESSAGES } from "../constants/messages.js";
import { User } from "../models/User.js";

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = new Review(req.body);
    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.reviewerId);
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: MESSAGES.REVIEW.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.reviewerId, req.body, { new: true });
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: MESSAGES.REVIEW.NOT_FOUND });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewerId);
    if (review) {
      res.json({ message: MESSAGES.REVIEW.DELETED });
    } else {
      res.status(404).json({ message: MESSAGES.REVIEW.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewsByReviewerId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reviewer = await User.findById(req.params.reviewerId);
    if (!reviewer) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const { reviewerId } = req.params;
    const reviews = await Review.find({ reviewerId: reviewer._id })
      .populate('reviewerId', 'email')
      .populate('reviewedUserId', 'email');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
