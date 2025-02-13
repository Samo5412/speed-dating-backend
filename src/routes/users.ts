import express, { Router } from "express";
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
} from "../controllers/users.js";

const router: Router = express.Router();

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.put("/:userId", updateUserById);

router.delete("/:userId", deleteUserById);

// TODO: Add Rate limiting with rateLimit from express-rate-limit
// TODO: Add authorization to access these routes

export const usersRouter = router;
