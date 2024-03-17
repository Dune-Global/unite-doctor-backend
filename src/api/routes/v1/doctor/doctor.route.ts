import express from "express";
import {
  getDoctors,
  getDoctorById,
  testAuth,
  updateDoctorDetails,
  updateDoctorPassword,
} from "../../../controllers/doctor/doctor.controller";
import { isAuthDoctor } from "../../../../middleware/auth";
import { localVariables } from "../../../../middleware/locals";
import { validateFields } from "../../../../middleware/json-body-validation/bodyFieldsValidate";
import {
  allowedUpdateDoctorFields,
  allowedDoctorLoginFields,
} from "../../../../middleware/json-body-validation/allowedJsonFields";
import { CustomRequest } from "../../../../types/customRequest";
import {
  loginDoctor,
  registerDoctor,
  activateAccount,
  sendResetPasswordEmail,
  validateResetPasswordToken,
  resetPassword,
  getVerifyEmail,
} from "../../../controllers/doctor/doctorAuth.controller";
import { refreshDoctor } from "../../../controllers/common/refreshToken.controller";

const router = express.Router();

// Auth test route
router.get("/test", isAuthDoctor, testAuth);

// Doctor routes
router.get("/all", isAuthDoctor, getDoctors);
router.get("/find-one", isAuthDoctor, getDoctorById);
router.put(
  "/update",
  isAuthDoctor,
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedUpdateDoctorFields;
    next();
  },
  validateFields,
  updateDoctorDetails
);
router.patch("/update-password", isAuthDoctor, updateDoctorPassword);

// Auth routes
router.post("/register", registerDoctor);
router.post(
  "/login",
  (req, _res, next) => {
    (req as CustomRequest).allowedFields = allowedDoctorLoginFields;
    next();
  },
  validateFields,
  loginDoctor
);
router.get("/activate-account", activateAccount);
router.get("/verify-email", getVerifyEmail);
router.post(
  "/send-reset-password-mail",
  localVariables,
  sendResetPasswordEmail
);
router.get("/validate-reset-password-token", validateResetPasswordToken);
router.patch("/reset-password", resetPassword);

router.get("/refresh", refreshDoctor);

export default router;
