/* PUT USER AUTH THINGIES HERE */

import { MESSAGES } from "../constants/messages.js";
import { User } from "../models/User.js";
import { Request, Response } from 'express';
import { UserProfile } from "../models/UserProfile.js";

export const register = async (req: Request, res: Response) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: MESSAGES.REGISTER.MISSING_CREDENTIALS });
        }
        const user = await User.findOne({"email": email});

        if (user) {
            return res.status(400).json({ error: MESSAGES.REGISTER.USER_EXISTS });
        }
        const newUser = new User({ email, password });
        const userProfile = new UserProfile({userId: newUser._id, fullName: `${firstname} ${lastname}`});
        newUser.profile = userProfile._id;
        await newUser.save();
        await userProfile.save();
        return res.status(201).json({ message: MESSAGES.REGISTER.USER_CREATED });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}