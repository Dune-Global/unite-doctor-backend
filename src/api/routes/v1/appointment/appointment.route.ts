import express from "express";
import {
  createNewAppointmentDate,
  getDoctorsAvailability,
  updateDoctorAvailability,
  updatedAvailabilityStatus,
  getAvailableAppointmentNumbers,
  getAnAppointment,
  cancelAnAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  doctorAppointmentStatusUpdate,
  getPatientTotalAppointments,
  getAnAppointmentsByDate
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
router.get("/doctor-appointments", isAuthDoctor, getDoctorAppointments);
router.get("/patient-appointments", isAuthPatient, getPatientAppointments);
router.patch(
  "/doctor-appointment-status/:appointmentId",
  isAuthDoctor,
  doctorAppointmentStatusUpdate
);
router.get("/patient-total-appointments", isAuthPatient, getPatientTotalAppointments);
router.get("/get-appointments-by-date/:year/:month/:day", isAuthDoctor, getAnAppointmentsByDate);

export default router;
