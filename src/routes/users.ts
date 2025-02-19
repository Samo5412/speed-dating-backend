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

router.post("/:userId/shared-contacts", verify, addSharedContact);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/", verify, getAllUsers);
router.get("/:userId", verify, getUserById);
router.get("/:userId/shared-contacts", verify, getAllSharedContactsForUser);
router.get("/:userId/shared-contacts/:contactId", verify, getSharedContactByContactId);

router.put("/:userId", verify, updateUserById);
router.put("/email/:userEmail", verify, updateUserByEmail);
router.put("/:userId/shared-contacts/:contactId", verify, updateSharedContact);

router.delete("/:userId", verify, deleteUserById);
router.delete("/:userId/shared-contacts/:contactId", verify, deleteSharedContact);

// Notification routes
router.post("/:userId/notifications", verify, createNotification);
router.get("/:userId/notifications", verify, getUserNotifications);
router.put("/:userId/notifications/:notificationId/read", verify, markNotificationAsRead);
router.delete("/:userId/notifications/:notificationId", verify, deleteNotification);

// TODO: Add Rate limiting with rateLimit from express-rate-limit

export const usersRouter = router;
