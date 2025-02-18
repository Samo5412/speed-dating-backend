import express, { Router } from "express";
import {
  getUserById,
  getAllUsers,
  updateUserById,
  deleteUserById,
  updateUserByEmail,
  addSharedContact,
  getAllSharedContactsForUser,
  getSharedContactByContactId,
  updateSharedContact,
  deleteSharedContact,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  createNotification,
} from "../controllers/users.js";
import { login, logout, register, verify } from "../auth/auth.js";

const router: Router = express.Router();

router.post("/:userId/shared-contacts", addSharedContact);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/", verify, getAllUsers);
router.get("/:userId", getUserById);
router.get("/:userId/shared-contacts", getAllSharedContactsForUser);
router.get("/:userId/shared-contacts/:contactId", getSharedContactByContactId);

router.put("/:userId", updateUserById);
router.put("/email/:userEmail", updateUserByEmail);
router.put("/:userId/shared-contacts/:contactId", updateSharedContact);

router.delete("/:userId", deleteUserById);
router.delete("/:userId/shared-contacts/:contactId", deleteSharedContact);

// Notification routes
router.post("/:userId/notifications", createNotification);
router.get("/:userId/notifications", getUserNotifications);
router.put("/:userId/notifications/:notificationId/read", markNotificationAsRead);
router.delete("/:userId/notifications/:notificationId", deleteNotification);

// TODO: Add Rate limiting with rateLimit from express-rate-limit

export const usersRouter = router;
