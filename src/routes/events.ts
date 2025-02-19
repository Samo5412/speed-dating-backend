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
import { verify } from "../auth/auth.js";

const router: Router = express.Router();

router.post("/", verify, createEvent);
router.post("/register/:eventId", verify, registerParticipantOnEvent);
router.post("/:eventId/start", verify, startEvent);
router.post("/:eventId/end", verify, endEvent);
router.post("/:eventId/nextRound", verify, startNextRound);
router.post("/:eventId/endRound", verify, endCurrentRound);

router.get("/", verify, getEvents);
router.get("/user/:userId", verify, getEventsForUser);
router.get("/:eventId", verify, getEvent);

router.put("/:eventId", verify, updateEvent);

router.delete("/:eventId", verify, deleteEvent);
router.delete("/register/:eventId", verify, unregisterParticipantFromEvent);

// TODO: Add authorization to access these routes

export const eventsRouter = router;
