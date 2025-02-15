import { Request, Response } from "express";
import { Event } from "../models/Event.js";
import { MESSAGES } from "../constants/messages.js";

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, { new: true });
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const registerParticipantOnEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.REGISTRATION.USER_ID_REQUIRED });
      return;
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    // Check if registration is still open
    if (
      event.registrationDeadline &&
      new Date(event.registrationDeadline) < new Date()
    ) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.REGISTRATION.DEADLINE_PASSED });
      return;
    }

    // Only add participants when the maximum number is not reached
    if (event.participants.length >= event.maximumParticipants) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.REGISTRATION.MAX_PARTICIPANTS });
      return;
    }

    // We do not add an already registered user
    if (event.participants.includes(userId)) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.REGISTRATION.ALREADY_REGISTERED });
      return;
    }

    // Add participant to event
    event.participants.push(userId);
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndDelete(req.params.eventId);
    if (event) {
      res.json({ message: MESSAGES.EVENT.DELETED });
    } else {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unregisterParticipantFromEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.REGISTRATION.USER_ID_REQUIRED });
      return;
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    // We can only remove participants that are currently registered
    if (!event.participants.includes(userId)) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.REGISTRATION.PARTICIPANT_NOT_REGISTERED });
      return;
    }

    // Remove participant from event
    event.participants.forEach((participantId, index) => {
      if (participantId.toString() === userId) {
        event.participants.splice(index, 1);
      }
    })
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
