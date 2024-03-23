import express from "express";
import {
  attachReport,
  deleteReport,
  getReportsPatient,
  getReportsDoctor,
  giveAccessToDoctor,
  removeAccessToDoctor
} from "./../../../controllers/doctor-patient/report.controller";
import { isAuthDoctor, isAuthPatient } from "./../../../../middleware/auth";

const router = express.Router();

router.post("/attach-report", isAuthPatient, attachReport);
router.get("/get-reports-patient", isAuthPatient, getReportsPatient);
router.get("/get-reports-doctor/:patientId", isAuthDoctor, getReportsDoctor);
router.delete("/delete-report/:reportId", isAuthPatient, deleteReport);
router.post(
  "/allow-doctor/:reportId",
  isAuthPatient,
  giveAccessToDoctor
);
router.post(
  "/remove-doctor/:reportId",
  isAuthPatient,
  removeAccessToDoctor
);

export default router;

//Update doctor view to two steps