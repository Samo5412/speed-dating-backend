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
