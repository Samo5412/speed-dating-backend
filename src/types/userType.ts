import { Types } from "mongoose";
import { ALLOWED_ROLES } from "../models/User.js";

export type UserType = {
	email: string;
	password?: string;
	salt?: string;
	role: (typeof ALLOWED_ROLES)[number];
	profile?: Types.ObjectId;
	sharedContacts?: {
		contact?: Types.ObjectId;
		status: "pending" | "accepted" | "blocked";
		createdAt: Date;
	}[];
	reviews?: Types.ObjectId[];
	notifications: {
		message: string;
		isRead: boolean;
		createdAt: Date;
	}[];
	dateMatches: {
		event?: Types.ObjectId;
		round: number;
		participant?: Types.ObjectId;
	}[];
	createdAt: Date;
};