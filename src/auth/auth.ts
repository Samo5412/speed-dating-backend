/* PUT USER AUTH THINGIES HERE */

import { MESSAGES } from "../constants/messages.js";
import { ALLOWED_ROLES, User } from "../models/User.js";
import { NextFunction, Request, Response } from "express";
import { UserProfile } from "../models/UserProfile.js";
import crypto from "crypto";
import { UserType } from "../types/userType.js";
import { send } from "process";
import { populate } from "dotenv";

declare module "express-session" {
	interface SessionData {
		user: UserType;
	}
}
export const register = async (req: Request, res: Response): Promise<void> => {
	try {
		const { fullName, email, password } = req.body;
		if (!email || !password) {
            res.status(400).json({
				error: MESSAGES.REGISTER.MISSING_CREDENTIALS,
			});
			return;
		}
		const user = await User.findOne({ email: email });

		if (user) {
            res.status(400).json({ error: MESSAGES.REGISTER.USER_EXISTS });
			return;
		}
        /** 
         * Here we could let the user choose their role in the frontend, but for now we'll just set it to participant by default I guess.
         */
        const salt = rand();
		const newUser = new User({
			email: email,
			salt: salt,
			password: auth(salt, password),
			role: ALLOWED_ROLES[1],
		});

		const userProfile = new UserProfile({
			userId: newUser._id,
			fullName: fullName,
		});
		newUser.profile = userProfile._id;
		await newUser.save();
		await userProfile.save();
        res.status(201).json({ message: MESSAGES.REGISTER.USER_CREATED });
	} catch (error) {
        res.status(500).json({ error: error.message });
	}
};

export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
            res.status(400).json({ error: MESSAGES.LOGIN.MISSING_CREDENTIALS });
			return;
		}
		const user = await User.findOne({ email: email }).select(
			"+password +salt"
		).populate("profile").lean();
		if (!user) {
            res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
			return;
		}
		if (user.password !== auth(user.salt, password)) {
            res.status(401).json({ error: MESSAGES.LOGIN.INVALID_CREDENTIALS });
			return;
		}
		req.session.user = user;
		const { password: _, salt: salt, ...userWithoutPassword } = user;
		res.status(200).send(userWithoutPassword);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const verify = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (!req.session.user) {
			return res.status(401).json({ error: "Unauthorized" });
		}
		req.body.identity = req.session.user;
		return next();
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const logout = (req: Request, res: Response): void => {
	try {
		req.session.destroy((err) => {
			if (err) {
				res.status(500).json({
					error: MESSAGES.LOGOUT.LOGOUT_FAILED,
				});
				return;
			}
			res.clearCookie("connect.sid");
			res.status(200).json({
				message: MESSAGES.LOGOUT.LOGOUT_SUCCESSFUL,
			});
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const rand = () => crypto.randomBytes(128).toString("base64");
export const auth = (salt, pw) => {
	return crypto
		.createHmac("sha256", [salt, pw].join("-"))
		.update(process.env.SECRET)
		.digest("hex");
};
