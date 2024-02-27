import express from "express";
import {
  registerDoctor,
  getDoctors,
  getDoctorById,
  doctorAuth,
  testAuth,
} from "../../controllers/doctor.controller";
import { isAuth } from "../../../middleware/auth";

const router = express.Router();

// Auth test route
router.get("/test", isAuth, testAuth);

// Doctor routes
router.get("/all", isAuth, getDoctors);
router.get("/:doctorId", isAuth, getDoctorById);

// Auth routes
router.post("/register", registerDoctor);
router.post("/login", doctorAuth);

export default router;
