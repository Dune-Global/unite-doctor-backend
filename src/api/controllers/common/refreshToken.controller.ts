import { Request, Response, NextFunction } from "express";
import {
  decodedDoctorPayload,
  decodedPatientPayload,
} from "../../../utils/jwt-auth/jwtDecoder";
import APIError from "../../../errors/api-error";
import httpStatus from "http-status";
import Doctor from "../../../models/doctor.model";
import Patient from "../../../models/patient.model";
import {
  createDoctorAccessToken,
  createPatientAccessToken,
} from "../../../utils/jwt-auth/generateToken";

//Doctor Refresh token controller
export const refreshDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenWithBarer = req.headers.authorization;
    if (!tokenWithBarer) {
      throw new APIError({
        message: "Invalid token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }
    const refreshToken = tokenWithBarer.slice(7);

    const result = decodedDoctorPayload(refreshToken);

    const doctorId: string = Object.values(result)[0];
    const { email, isSlmcVerified, isEmailVerified, imgUrl, designation } =
      await Doctor.get(doctorId);

    const accessToken = createDoctorAccessToken({
      id: doctorId,
      email: email,
      isEmailVerified: isEmailVerified,
      isSlmcVerified: isSlmcVerified,
      designation: designation,
      imgUrl: imgUrl,
    });

    res.json({
      message: "Access granted",
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

//Patient Refresh token controller
export const refreshPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenWithBarer = req.headers.authorization;
    if (!tokenWithBarer) {
      throw new APIError({
        message: "Invalid token",
        errors: [],
        status: httpStatus.UNAUTHORIZED,
        stack: "",
      });
    }
    const refreshToken = tokenWithBarer.slice(7);

    const result = decodedPatientPayload(refreshToken);

    const patientId: string = Object.values(result)[0];
    const { email, isEmailVerified, imgUrl } = await Patient.get(patientId);

    const accessToken = createPatientAccessToken({
      id: patientId,
      email: email,
      isEmailVerified: isEmailVerified,
      imgUrl: imgUrl,
    });

    res.json({
      message: "Access granted",
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};
