import express, { Request, Response } from "express";
import doctorRouter from "./doctor/doctor.route";
import patientRouter from "./patient/patient.router";
import doctorPatientRouter from "./doctor-patient/doctorPatient.route";
import appointmentRouter from "./../../routes/v1/appointment/appointment.route";
import fileServer from "./../../routes/v1/common/fileService.route";
import enumsRouter from "./common/enums.route";
import report from "./doctor-patient/report.router"

const router = express.Router();

// Test route for check overall connectivity
router.get("/tryme", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

// Plug the router into the express app
router.use("/doctor", doctorRouter);
router.use("/patient", patientRouter);
router.use("/patient-doc", doctorPatientRouter);
router.use("/appointment", appointmentRouter);
router.use("/file", fileServer);
router.use("/report", report);


// common routes
router.use("/common", enumsRouter);

export default router;
