import express from "express";
import {
  registerDoctor,
  getDoctors,
  getDoctorById,
  loginDoctor,
  testAuth,
  updateDoctorDetails,
} from "../../controllers/doctor.controller";
import { isAuth } from "../../../middleware/auth";
import { validateFields } from "../../../middleware/json-body-validation/bodyFieldsValidate";
import {
  allowedUpdateDoctorFields,
  allowedDoctorLogiFields,
} from "../../../middleware/json-body-validation/allowedDoctorJsonFields";
import { CustomRequest } from "../../../types/customRequest";

const router = express.Router();

// Auth test route
router.get("/test", isAuth, testAuth);

// Doctor routes
router.get("/all", isAuth, getDoctors);
router.get("/:doctorId", isAuth, getDoctorById);
router.put(
  "/update/:doctorId",
  isAuth,
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedUpdateDoctorFields;
    next();
  },
  validateFields,
  updateDoctorDetails
);
// Auth routes
router.post("/register", registerDoctor);
router.post(
  "/login",
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedDoctorLogiFields;
    next();
  },
  validateFields,
  loginDoctor
);

export default router;
