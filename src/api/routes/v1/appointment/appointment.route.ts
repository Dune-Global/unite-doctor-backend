import express from "express";
import {
  createNewAppointmentDate,
  getDoctorsAvailability,
  updateDoctorAvailability,
  updatedAvailabilityStatus,
  getAvailableAppointmentNumbers,
  getAnAppointment,
  cancelAnAppointment
} from "./../../../controllers/appointment/appointment.controller";
import { isAuthDoctor, isAuthPatient } from "../../../../middleware/auth";

const router = express.Router();

router.post("/create-availability", isAuthDoctor, createNewAppointmentDate);
router.get("/get-availability/:doctorId", getDoctorsAvailability);
router.patch("/update-availability/:availabilityId", isAuthDoctor, updateDoctorAvailability);
router.patch("/update-availability-status/:availabilityId", isAuthDoctor, updatedAvailabilityStatus);
router.get("/get-appointment-numbers/:availabilityId", getAvailableAppointmentNumbers);
router.post("/get-appointment/:availabilityId", getAnAppointment);
router.delete(
  "/delete-availability/:appointmentId",
  isAuthPatient,
  cancelAnAppointment
);

export default router;
