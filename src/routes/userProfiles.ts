import express, { Router } from "express";
import { 
  createProfile,
  getProfile,
  getProfiles,
  updateProfile,
  deleteProfile
} from "../controllers/userProfiles.js";

const router: Router = express.Router();

router.post("/", createProfile);
router.get("/", getProfiles);
router.get("/:userId", getProfile);
router.put("/:userId", updateProfile);
router.delete("/:userId", deleteProfile);

export const userProfilesRouter = router;
