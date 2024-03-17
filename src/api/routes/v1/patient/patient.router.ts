import express from "express";
import {
  getPatient,
  getPatientById,
  testAuth,
  updatePatientDetails,
  updatePatientPassword,
} from "../../../controllers/patient/patient.controller";
import { isAuthDoctorOrPatient, isAuthPatient } from "../../../../middleware/auth";
import { localVariables } from "../../../../middleware/locals";
import { validateFields } from "../../../../middleware/json-body-validation/bodyFieldsValidate";
import {
  allowedUpdatePatientFields,
  allowedPatientLoginFields,
} from "../../../../middleware/json-body-validation/allowedJsonFields";
import { CustomRequest } from "../../../../types/customRequest";
import {
  loginPatient,
  registerPatient,
  activateAccount,
  sendResetPasswordEmail,
  validateResetPasswordToken,
  resetPassword,
  getVerifyEmail
} from "../../../controllers/patient/patientAuth.controller";
import { refreshPatient } from "../../../controllers/common/refreshToken.controller";

const router = express.Router();

// Auth test route
router.get("/test", isAuthPatient, testAuth);

// Doctor routes
router.get("/all", isAuthPatient, getPatient);
router.get("/find-one/:patientId", isAuthDoctorOrPatient, getPatientById);
router.put(
  "/update",
  isAuthPatient,
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedUpdatePatientFields;
    next();
  },
  validateFields,
  updatePatientDetails
);
router.patch("/update-password", isAuthPatient, updatePatientPassword);

// Auth routes
router.post("/register", registerPatient);
router.post(
  "/login",
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedPatientLoginFields;
    next();
  },
  validateFields,
  loginPatient
);
router.get("/verify-email", getVerifyEmail);
router.get("/activate-account", activateAccount);
router.post(
  "/send-reset-password-mail",
  localVariables,
  sendResetPasswordEmail
);
router.get("/validate-reset-password-token", validateResetPasswordToken);
router.patch("/reset-password", resetPassword);

router.get("/refresh", refreshPatient);

export default router;
