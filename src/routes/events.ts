import express, { Router } from "express";
import { 
  createEvent,
  getEvent,
  getEvents,
  updateEvent,
  deleteEvent
} from "../controllers/events.js";

const router: Router = express.Router();

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:eventId", getEvent);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);

// TODO: Add authorization to access these routes

export const eventsRouter = router;
