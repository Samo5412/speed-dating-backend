import { Request, Response } from "express";
import { User } from "../models/User.js";
import { MESSAGES } from "../constants/messages.js";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (user) {
      res.json({ message: MESSAGES.USER.DELETED });
    } else {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
