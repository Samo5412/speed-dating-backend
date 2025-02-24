import express, { Router } from "express";
import { 
  createProfile,
  getProfile,
  getProfiles,
  updateProfile,
  deleteProfile,
  uploadPic,
} from "../controllers/userProfiles.js";
import { verify } from "../auth/auth.js";

const router: Router = express.Router();

router.post("/:userId/upload",verify, uploadPic);

router.post("/", verify, createProfile);
router.get("/", verify, getProfiles);
router.get("/:userId", verify, getProfile);
router.put("/:userId", verify, updateProfile);
router.delete("/:userId", verify, deleteProfile);

export const userProfilesRouter = router;
