import express, { Router } from "express";
import {
  createEvent,
  getEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  registerParticipantOnEvent,
  unregisterParticipantFromEvent,
} from "../controllers/events.js";

const router: Router = express.Router();

router.post("/", createEvent);
router.post("/register/:eventId", registerParticipantOnEvent);
router.get("/", getEvents);
router.get("/:eventId", getEvent);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);
router.delete("/register/:eventId", unregisterParticipantFromEvent);

// TODO: Add authorization to access these routes

export const eventsRouter = router;
