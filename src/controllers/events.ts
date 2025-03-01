import { Request, Response } from "express";
import { Event } from "../models/Event.js";
import { MESSAGES } from "../constants/messages.js";
import { ALLOWED_ROLES } from "../models/User.js";

export const createEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.session.user?.role !== ALLOWED_ROLES[0]) {
      res.status(400).json({
        error: MESSAGES.EVENT.MANAGEMENT.MUST_BE_ORGANIZER_TO_CREATE_EVENT,
      });
      return;
    }

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
    const event = await Event.findById(req.params.eventId)
      .populate({
        path: "participants",
        populate: {
          path: "profile",
          model: "UserProfile",
          select: "fullName avatarUrl dateOfBirth gender",
        },
      })
      .exec();

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
    });
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

export const startEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    // Check if event is already active
    if (event.isEventActive) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.MANAGEMENT.ALREADY_ACTIVE });
      return;
    }

    event.isEventActive = true;
    event.nextRound = {
      roundNumber: 1,
      isRoundActive: false,
      startTime: event.startDateTime,
      // TODO: endTime is set to 15 minutes later. Will probably need to be changed.
      endTime: new Date(new Date(event.startDateTime).getTime() + 15 * 60000),
    };

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const endEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    // We only want to end an active event
    if (!event.isEventActive) {
      res.status(400).json({ message: MESSAGES.EVENT.MANAGEMENT.NOT_ACTIVE });
      return;
    }

    event.isEventActive = false;
    if (event.nextRound) {
      event.nextRound.isRoundActive = false;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const startNextRound = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    // We only start the the next round if the event is active
    if (!event.isEventActive) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.MANAGEMENT.MUST_BE_ACTIVE });
      return;
    }

    // We only start the next round if the current one is not active
    if (event.nextRound?.isRoundActive) {
      res.status(400).json({ message: MESSAGES.EVENT.MANAGEMENT.ROUND_ACTIVE });
      return;
    }

    // The maximum number of rounds is 3
    const currentRoundNumber = event.nextRound?.roundNumber || 0;
    if (currentRoundNumber >= 3) {
      res.status(400).json({ message: MESSAGES.EVENT.MANAGEMENT.MAX_ROUNDS });
      return;
    }

    // Calculate new round times
    const startTime = new Date();
    // TODO: endTime is set to 15 minutes later. Will probably need to be changed.
    const endTime = new Date(startTime.getTime() + 15 * 60000);

    event.nextRound = {
      roundNumber: currentRoundNumber + 1,
      isRoundActive: true,
      startTime,
      endTime,
    };

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const endCurrentRound = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    // We only end the current round if the event is active
    if (!event.isEventActive) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.MANAGEMENT.MUST_BE_ACTIVE_FOR_ROUND });
      return;
    }

    // We can only end the current round if one is active
    if (!event.nextRound?.isRoundActive) {
      res
        .status(400)
        .json({ message: MESSAGES.EVENT.MANAGEMENT.NO_ACTIVE_ROUND });
      return;
    }

    event.nextRound.isRoundActive = false;
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      res.status(400).json({
        message: MESSAGES.EVENT.REGISTRATION.PARTICIPANT_NOT_REGISTERED,
      });
      return;
    }

    // Remove participant from event
    event.participants.forEach((participantId, index) => {
      if (participantId.toString() === userId) {
        event.participants.splice(index, 1);
      }
    });
    const updatedEvent = await event.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEventsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const events = await Event.find({
      $or: [{ participants: userId }, { organizer: userId }],
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLatestEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const latestEvent = await Event.findOne().sort({ createdAt: -1 });

    if (!latestEvent) {
      res.status(404).json({ message: MESSAGES.EVENT.NOT_FOUND });
      return;
    }

    res.status(200).json(latestEvent);
  } catch (error) {
    res
      .status(500)
      .json({ message: MESSAGES.EVENT.MANAGEMENT.EVENT_FETCH_ERROR });
  }
};
