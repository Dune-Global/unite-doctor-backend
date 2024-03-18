import express from "express";
import { connectPatientDoc } from "../../../controllers/doctor-patient/doctorPatient.controller";
import { isAuthPatient } from "./../../../../middleware/auth";

const router = express.Router();

router.get("/connect/:doctorId", isAuthPatient, connectPatientDoc);

export default router;
