import { Request, Response, NextFunction } from "express";
import { decodedPayload } from "../../../utils/jwtDecoder";
import APIError from "../../../errors/api-error";
import httpStatus from "http-status";
import Doctor from "../../../models/doctor.model";
import { createAccessToken } from "../../../utils/generateToken";

// Refresh token controller
export const refresh = async (
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

    const result = decodedPayload(refreshToken);

    const doctorId: string = Object.values(result)[0];
    const { email, isSlmcVerified, isEmailVerified } = await Doctor.get(
      doctorId
    );

    const accessToken = createAccessToken({
      id: doctorId,
      email: email,
      isEmailVerified: isEmailVerified,
      isSlmcVerified: isSlmcVerified,
    });

    res.json({
      message: "Access granted",
      accessToken: accessToken,
    });
  } catch (error) {
    next(error);
  }
};
