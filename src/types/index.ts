// errors
export { IErrorDetails } from "./error";
export { IAPIError } from "./error";

// Doctor
export {
  IDoctor,
  IDoctorMethods,
  ITransformedDoctor,
  IDoctorModel,
  IList,
  IDoctorLoginRequest,
  IDoctorSuccessLogin,
  IDoctorUpdatableFields,
  IDoctorUpdateSuccess,
} from "./doctor";

export {
  IPatient,
  IPatientMethods,
  ITransformedPatient,
  IPatientModel,
  IPatientLoginRequest,
  IPatientSuccessLogin,
  IPatientUpdatableFields,
  IPatientUpdateSuccess,
} from "./patient";

// JWT
export { IDoctorAccessToken, IRefreshToken, IPatientAccessToken } from "./jwt";

// Account activation token
export { IAccountActivationToken } from "./accountActivationToken";

// Reset password token
export { IResetPasswordToken } from "./resetPasswordToken";
