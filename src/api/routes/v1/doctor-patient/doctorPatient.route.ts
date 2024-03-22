import express from "express";
import {
  connectPatientDoc,
  addPrescription,
  getConnectedDoctors,
  getConnectedPatients,
  getDoctorPatientDetail,
  disconnectPatientDoc,
  givePermissionToDoctors,
  getPermissionDoctors,
  removePermissionFromDoctors,
  getSharedDoctors,
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
router.get("/shared-doctors", isAuthDoctor, getSharedDoctors);
router.post(
  "/give-permission/:patientSessionId",
  isAuthPatient,
  givePermissionToDoctors
);
router.get(
  "/get-permission/:patientSessionId",
  isAuthPatient,
  getPermissionDoctors
);
router.delete(
  "/remove-permission/:patientSessionId",
  isAuthPatient,
  removePermissionFromDoctors
);

export default router;
