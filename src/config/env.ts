import dotenv from "dotenv";

dotenv.config();

export default {
  env: process.env.NODE_ENV,
  mongo: {
    uri: process.env.MONGO_CONNECTION_STRING,
  },
  isDev: process.env.NODE_ENV === "dev",
  host: process.env.HOST,
  port: process.env.PORT,
  bcryptRounds: 10,
  doctorRefreshTokenSecret: process.env.DOCTOR_REFRESH_TOKEN_SECRET,
  doctorAccessTokenSecret: process.env.DOCTOR_ACCESS_TOKEN_SECRET,
  patientRefreshTokenSecret: process.env.PATIENT_REFRESH_TOKEN_SECRET,
  patientAccessTokenSecret: process.env.PATIENT_ACCESS_TOKEN_SECRET,
  refreshTokenExpIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  accessTokenExpIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  emailUser: process.env.EMAIL_USER,
  emailAppPassword: process.env.EMAIL_APP_PASSWORD,
  accountActivationTokenSecret: process.env.ACCOUNT_ACTIVATION_TOKEN_SECRET,
  accountActivationTokenExpIn: process.env.ACCOUNT_ACTIVATION_TOKEN_EXPIRES_IN,
  passwordResetTokenSecret: process.env.PASSWORD_RESET_TOKEN_SECRET,
  passwordResetTokenExpIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN,
  patientFrontendUrl: process.env.PATIENT_FRONTEND_URL,
  doctorFrontendUrl: process.env.DOCTOR_FRONTEND_URL,
  isSession: process.env.IS_SESSION as unknown as boolean,
};
