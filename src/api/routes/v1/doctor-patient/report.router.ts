import express from "express";
import {
  attachReport,
  deleteReport,
  getReportsPatient,
  getReportsDoctor,
  getDoctorsWithAccess,
  updateDoctorsAccess,
  doctorViewReport
} from "./../../../controllers/doctor-patient/report.controller";
import { isAuthDoctor, isAuthPatient } from "./../../../../middleware/auth";

const router = express.Router();

router.post("/attach-report", isAuthPatient, attachReport);
router.get("/get-reports-patient", isAuthPatient, getReportsPatient);
router.get("/get-reports-doctor/:patientId", isAuthDoctor, getReportsDoctor);
router.delete("/delete-report/:reportId", isAuthPatient, deleteReport);
router.get("/get-doctors-with-access/:reportId", isAuthPatient, getDoctorsWithAccess);
router.put("/update-doctors-access/:reportId", isAuthPatient, updateDoctorsAccess);
router.get("/doctor-view-report/:reportId", isAuthDoctor, doctorViewReport);

export default router;