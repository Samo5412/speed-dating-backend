import { Request, Response } from "express";
import { UserProfile } from "../models/UserProfile.js";
import { User } from "../models/User.js";
import { MESSAGES } from "../constants/messages.js";
import mongoose from "mongoose";

export const createProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  // We use a session and transaction as we make changes to both User and UserProfile collections
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.body;

    // Check if user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    // Check if user already has a profile
    const existingProfile = await UserProfile.findOne({ userId }).session(
      session
    );
    if (existingProfile) {
      await session.abortTransaction();
      res.status(400).json({ message: MESSAGES.PROFILE.ALREADY_EXISTS });
      return;
    }

    // Create new profile
    const profile = new UserProfile(req.body);
    const savedProfile = await profile.save({ session });

    // Update user with profile reference
    user.profile = savedProfile._id;
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json(savedProfile);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getProfiles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profiles = await UserProfile.find().populate("userId", "email role");
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const profile = await UserProfile.findOne({
      userId: req.params.userId,
    }).populate("userId", "email role");
    if (profile) {
      res.json(profile);
    } else {
      res.status(404).json({ message: MESSAGES.PROFILE.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if profile exists
    const existingProfile = await UserProfile.findOne({
      userId: req.params.userId,
    }).session(session);
    if (!existingProfile) {
      await session.abortTransaction();
      res.status(404).json({ message: MESSAGES.PROFILE.NOT_FOUND });
      return;
    }

    // Update profile
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true, session, runValidators: true } // Respect validation rules when updating
    ).populate("userId", "email role"); // We want email and role in the response

    await session.commitTransaction();
    res.json(updatedProfile);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const profile = await UserProfile.findOneAndDelete({
      userId: req.params.userId,
    }).session(session);
    if (!profile) {
      await session.abortTransaction();
      res.status(404).json({ message: MESSAGES.PROFILE.NOT_FOUND });
      return;
    }

    // Remove profile reference from user
    await User.findByIdAndUpdate(
      profile.userId,
      { $unset: { profile: 1 } },
      { session }
    );

    await session.commitTransaction();
    res.json({ message: MESSAGES.PROFILE.DELETED });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};


export const uploadPic = async(
  req: any, 
  res:Response): Promise<void> => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { image } = req.files;

      if (!image || !(image.mimetype as string).includes("image")) {
        res.status(400);
        return;
      } 

      const fileName = (image.name as string).replace(/^[0-9\s]*|[+*\r\n]/g, '');

      image.mv(__dirname + '/images/' + fileName);

      const updated = await UserProfile.findByIdAndUpdate(
        req.params.userId,
        { avatarUrl: fileName},
        { new: true, session, runValidators: true }
      ).populate("userId", "avatarUrl");

      if(!updated) {
        await session.abortTransaction();
        res.status(404).json({ message: MESSAGES.PROFILE.NOT_FOUND });
        return;
      }

      await session.commitTransaction();
      res.sendStatus(200).json({message: "image uploaded!"});

    }catch (error) {
      await session.abortTransaction();
      res.status(500).json({ message: error.message });
    } finally {
      session.endSession();
    }
  }