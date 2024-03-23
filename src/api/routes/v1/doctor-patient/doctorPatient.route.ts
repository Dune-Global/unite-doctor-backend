import express from "express";
import {
  connectPatientDoc,
  addPrescription,
  getConnectedDoctors,
  getConnectedPatients,
  getDoctorPatientDetail,
  disconnectPatientDoc,
  permissionsForDoctors,
  getPermissionDoctors,
  updateSharedDoctors,
  getSharedDoctors,
  getDashboardData,
} from "../../../controllers/doctor-patient/doctorPatient.controller";
import {
  isAuthDoctor,
  isAuthDoctorOrPatient,
  isAuthPatient,
} from "./../../../../middleware/auth";

const router = express.Router();

router.get("/connect/:doctorId", isAuthPatient, connectPatientDoc);
router.delete("/disconnect/:doctorId", isAuthPatient, disconnectPatientDoc);
router.post("/add-prescription/:patientId", isAuthDoctor, addPrescription);
router.get(
  "/doctor-patient-detail/:patientSessionId",
  isAuthDoctorOrPatient,
  getDoctorPatientDetail
);
router.get("/connected-patients", isAuthDoctor, getConnectedPatients);
router.get("/connected-doctors", isAuthPatient, getConnectedDoctors);
router.get("/shared-doctors/:patientId", isAuthDoctor, getSharedDoctors);
router.get(
  "/give-permission/:patientSessionId",
  isAuthPatient,
  permissionsForDoctors
);
router.get(
  "/get-permission/:patientSessionId",
  isAuthPatient,
  getPermissionDoctors
);
router.put(
  "/update-permission/:patientSessionId",
  isAuthPatient,
  updateSharedDoctors
);
router.get("/dashboard-data", isAuthDoctor, getDashboardData);

export default router;
