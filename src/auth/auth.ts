/* PUT USER AUTH THINGIES HERE */

import { MESSAGES } from "../constants/messages.js";
import { ALLOWED_ROLES, User } from "../models/User.js";
import { NextFunction, Request, Response } from "express";
import { UserProfile } from "../models/UserProfile.js";
import crypto from "crypto";
import { UserType } from "../types/userType.js";
import { send } from "process";

declare module "express-session" {
	interface SessionData {
		user: UserType;
	}
}
export const register = async (req: Request, res: Response) => {
	try {
		const { fullName, email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ error: MESSAGES.REGISTER.MISSING_CREDENTIALS });
		}
		const user = await User.findOne({ email: email });

		if (user) {
			return res
				.status(400)
				.json({ error: MESSAGES.REGISTER.USER_EXISTS });
		}
		const newUser = new User({
			email: email,
			salt: rand(),
			password: auth(rand(), password),
			role: ALLOWED_ROLES[1],
		});

		const userProfile = new UserProfile({
			userId: newUser._id,
			fullName: fullName,
		});
		newUser.profile = userProfile._id;
		await newUser.save();
		await userProfile.save();
		return res
			.status(201)
			.json({ message: MESSAGES.REGISTER.USER_CREATED });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res
				.status(400)
				.json({ error: MESSAGES.LOGIN.MISSING_CREDENTIALS });
		}
		const user = await User.findOne({ email: email }).select(
			"+password +salt"
		);
		if (!user) {
			return res.status(404).json({ error: MESSAGES.USER.NOT_FOUND });
		}
		if (user.password !== auth(user.salt, password)) {
			return res
				.status(401)
				.json({ error: MESSAGES.LOGIN.INVALID_CREDENTIALS });
		}
		req.session.user = user;
		const { password: _, salt: salt, ...userWithoutPassword } = user;
		return res.status(200).send(userWithoutPassword);
	} catch (error) {
		return res.status(500).json({ error: error.message });
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

export const rand = () => crypto.randomBytes(128).toString("base64");
export const auth = (salt, pw) => {
	return crypto
		.createHmac("sha256", [salt, pw].join("-"))
		.update(process.env.SECRET)
		.digest("hex");
};
