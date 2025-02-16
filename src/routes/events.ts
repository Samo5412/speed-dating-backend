import express, { Router } from "express";
import {
  createEvent,
  getEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  registerParticipantOnEvent,
  unregisterParticipantFromEvent,
  startEvent,
  endEvent,
  startNextRound,
  endCurrentRound,
  getEventsForUser
} from "../controllers/events.js";

const router: Router = express.Router();

router.post("/", createEvent);
router.post("/register/:eventId", registerParticipantOnEvent);
router.post("/:eventId/start", startEvent);
router.post("/:eventId/end", endEvent);
router.post("/:eventId/nextRound", startNextRound);
router.post("/:eventId/endRound", endCurrentRound);

router.get("/", getEvents);
router.get("/user/:userId", getEventsForUser);
router.get("/:eventId", getEvent);

router.put("/:eventId", updateEvent);

router.delete("/:eventId", deleteEvent);
router.delete("/register/:eventId", unregisterParticipantFromEvent);

// TODO: Add authorization to access these routes

export const eventsRouter = router;
