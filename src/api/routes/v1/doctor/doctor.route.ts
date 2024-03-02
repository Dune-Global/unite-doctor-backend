import express from "express";
import {
  getDoctors,
  getDoctorById,
  testAuth,
  updateDoctorDetails,
  updateDoctorPassword,
} from "../../../controllers/doctor/doctor.controller";
import { isAuth } from "../../../../middleware/auth";
import { localVariables } from "../../../../middleware/locals";
import { validateFields } from "../../../../middleware/json-body-validation/bodyFieldsValidate";
import {
  allowedUpdateDoctorFields,
  allowedDoctorLogiFields,
} from "../../../../middleware/json-body-validation/allowedDoctorJsonFields";
import { CustomRequest } from "../../../../types/customRequest";
import {
  loginDoctor,
  registerDoctor,
  activateAccount,
  sendResetPasswordEmail,
  validateResetPasswordToken,
  resetPassword,
} from "../../../controllers/doctor/doctorAuth.controller";

const router = express.Router();

// Auth test route
router.get("/test", isAuth, testAuth);

// Doctor routes
router.get("/all", isAuth, getDoctors);
router.get("/find-one/:doctorId", isAuth, getDoctorById);
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
router.patch("/update-password/:doctorId", isAuth, updateDoctorPassword);

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
router.get("/activate-account/:token", activateAccount);
router.post(
  "/send-reset-password-mail",
  localVariables,
  sendResetPasswordEmail
);
router.get("/validate-reset-password-token/:token", validateResetPasswordToken);
router.patch("/reset-password/:token", resetPassword);

export default router;
