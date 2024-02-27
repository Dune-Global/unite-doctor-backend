import express from "express";
import {
  registerDoctor,
  getDoctors,
  getDoctorById,
} from "../../controllers/doctor.controller";

const router = express.Router();

router.get("/all", getDoctors);
router.get("/:doctorId", getDoctorById);
router.post("/register", registerDoctor);

export default router;
