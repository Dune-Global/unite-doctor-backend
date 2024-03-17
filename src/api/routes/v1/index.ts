import express, { Request, Response } from "express";
import doctorRouter from "./doctor/doctor.route";
import patientRouter from "./patient/patient.router";
import doctorPatientRouter from "./doctor-patient/doctorPatient.route";
import enumsRouter from "./common/enums.route";

const router = express.Router();

// Test route for check overall connectivity
router.get("/tryme", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

// Plug the router into the express app
router.use("/doctor", doctorRouter);
router.use("/patient",patientRouter);
router.use("/patient-doc",doctorPatientRouter)

// common routes
router.use("/common", enumsRouter);

export default router;
