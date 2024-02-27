import express from "express";
import {
  registerDoctor,
  getDoctors,
} from "../../controllers/doctor.controller";

const router = express.Router();

router.get("/all", getDoctors);
router.post("/register", registerDoctor);

export default router;