import { Request, Response } from "express";
import { UserProfile } from "../models/UserProfile.js";

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = new UserProfile(req.body);
    const savedProfile = await profile.save();
    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await UserProfile.find();
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await UserProfile.findOne({ userId: req.params.userId });
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await UserProfile.findOneAndDelete({ userId: req.params.userId });
    if (profile) {
      res.json({ message: "Profile deleted" });
    } else {
      res.status(404).json({ message: "Profile not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
