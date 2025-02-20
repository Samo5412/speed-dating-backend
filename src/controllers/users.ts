import { Request, Response } from "express";
import { User } from "../models/User.js";
import { UserProfile } from "../models/UserProfile.js";
import { Review } from "../models/Review.js";
import { MESSAGES } from "../constants/messages.js";
import mongoose from "mongoose";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUserByEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.userEmail },
      req.body,
      { new: true }
    );
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: MESSAGES.USER.EMAIL_NOT_FOUND });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Check if user exists
    const user = await User.findById(req.params.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    // Delete associated UserProfile if it exists
    if (user.profile) {
      await UserProfile.findByIdAndDelete(user.profile).session(session);
    }

    // Delete existing reviews
    await Review.deleteMany({
      $or: [
        { reviewerId: req.params.userId },
        { reviewedUserId: req.params.userId },
      ],
    }).session(session);

    // Delete the user
    await user.deleteOne().session(session);
    await session.commitTransaction();
    res.json({ message: MESSAGES.USER.DELETED });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

export const getAllSharedContactsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "sharedContacts.contactId"
    );
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }
    res.json(user.sharedContacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSharedContactByContactId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const sharedContact = user.sharedContacts.find(
      (contact) => contact.contactId.toString() === req.params.contactId
    );
    if (!sharedContact) {
      res.status(404).json({ message: MESSAGES.SHARED_CONTACT.NOT_FOUND });
      return;
    }

    const populatedContact = await User.findById(sharedContact.contactId);
    res.json({ ...sharedContact.toObject(), contact: populatedContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addSharedContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const { contactId } = req.body;

    // Check if contact user exists
    const contactUser = await User.findById(contactId);
    if (!contactUser) {
      res
        .status(404)
        .json({ message: MESSAGES.SHARED_CONTACT.CONTACT_NOT_FOUND });
      return;
    }

    // Check if contact already exists
    const existingContact = user.sharedContacts.find(
      (contact) => contact.contactId.toString() === contactId
    );
    if (existingContact) {
      res.status(400).json({ message: MESSAGES.SHARED_CONTACT.ALREADY_EXISTS });
      return;
    }

    user.sharedContacts.push({
      contactId: contactId,
      status: "pending",
      createdAt: new Date(),
    });

    await user.save();
    res.status(201).json(user.sharedContacts[user.sharedContacts.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSharedContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const { status } = req.body;

    // Check if contact user exists
    const contactUser = await User.findById(req.params.contactId);
    if (!contactUser) {
      res
        .status(404)
        .json({ message: MESSAGES.SHARED_CONTACT.CONTACT_NOT_FOUND });
      return;
    }

    // Check if contact is already added to shared contacts
    const existingContact = user.sharedContacts.find(
      (contact) => contact.contactId.toString() === contactUser._id.toString()
    );
    if (!existingContact) {
      res.status(404).json({ message: MESSAGES.SHARED_CONTACT.NOT_FOUND });
      return;
    }

    existingContact.status = status;
    await user.save();
    res.json(existingContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSharedContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const contactUser = await User.findById(req.params.contactId);
    if (!contactUser) {
      res
        .status(404)
        .json({ message: MESSAGES.SHARED_CONTACT.CONTACT_NOT_FOUND });
      return;
    }

    // Check if contact exists as a shared contact
    const existingContact = user.sharedContacts.find(
      (contact) => contact.contactId.toString() === contactUser._id.toString()
    );
    if (!existingContact) {
      res.status(404).json({ message: MESSAGES.SHARED_CONTACT.NOT_FOUND });
      return;
    }

    // Remove contact from shared contacts
    const contactIndex = user.sharedContacts.findIndex(
      (contact) => contact.contactId.toString() === contactUser._id.toString()
    );
    user.sharedContacts.splice(contactIndex, 1);
    await user.save();
    res.json({ message: MESSAGES.SHARED_CONTACT.DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ message: MESSAGES.NOTIFICATION.MESSAGE_REQUIRED });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const notification = {
      message,
      isRead: false,
      createdAt: new Date(),
    };

    if (!user.notifications) {
      user.$set("notifications", []);
    }

    user.notifications.push(notification);
    await user.save();

    // We want to send the _id with the response
    const createdNotification =
      user.notifications[user.notifications.length - 1];

    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    const notifications = user.notifications || [];
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    // Check if notification exists
    const notification = user.notifications?.find(
      (n) => n._id.toString() === notificationId
    );
    if (!notification) {
      res.status(404).json({ message: MESSAGES.NOTIFICATION.NOT_FOUND });
      return;
    }

    notification.isRead = true;
    await user.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, notificationId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
      return;
    }

    // Check if notification exists
    const notificationIndex = user.notifications?.findIndex(
      (n) => n._id.toString() === notificationId
    );
    if (notificationIndex === -1 || notificationIndex === undefined) {
      res.status(404).json({ message: MESSAGES.NOTIFICATION.NOT_FOUND });
      return;
    }

    user.notifications?.splice(notificationIndex, 1);
    await user.save();

    res.status(200).json({ message: MESSAGES.NOTIFICATION.DELETED });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
