import { Request, Response } from "express";
import { User } from "../models/User.js";
import { MESSAGES } from "../constants/messages.js";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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

    // Check if contact exists
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
