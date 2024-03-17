import httpStatus from "http-status";
import APIError from "../errors/api-error";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import env from "../config/env";
import { IDoctorAccessToken, IPatientAccessToken } from "../types";

export const isAuthDoctor = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    next(
      new APIError({
        message: "Unauthorized",
        stack: "",
        status: httpStatus.UNAUTHORIZED,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Authorization Header Missing"],
          },
        ],
      })
    );
  }

  try {
    const token = authorization?.split(" ")[1];
    const payload: IDoctorAccessToken = verify(
      token!,
      env.doctorAccessTokenSecret!
    ) as IDoctorAccessToken;
    console.log(payload);
  } catch (err) {
    next(
      new APIError({
        message: err.message,
        errors: [],
        stack: err.stack,
        status: httpStatus.UNAUTHORIZED,
      })
    );
  }

  next();
};

export const isAuthPatient = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    next(
      new APIError({
        message: "Unauthorized",
        stack: "",
        status: httpStatus.UNAUTHORIZED,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Authorization Header Missing"],
          },
        ],
      })
    );
  }

  try {
    const token = authorization?.split(" ")[1];
    const payload: IPatientAccessToken = verify(
      token!,
      env.patientAccessTokenSecret!
    ) as IPatientAccessToken;
    console.log(payload);
  } catch (err) {
    next(
      new APIError({
        message: err.message,
        errors: [],
        stack: err.stack,
        status: httpStatus.UNAUTHORIZED,
      })
    );
  }

  next();
};

export const isAuthDoctorOrPatient = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    return next(
      new APIError({
        message: "Unauthorized",
        stack: "",
        status: httpStatus.UNAUTHORIZED,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Authorization Header Missing"],
          },
        ],
      })
    );
  }

  try {
    const token = authorization?.split(" ")[1];
    let payload: IDoctorAccessToken | IPatientAccessToken;

    try {
      payload = verify(token!, env.doctorAccessTokenSecret!) as IDoctorAccessToken;
    } catch {
      payload = verify(token!, env.patientAccessTokenSecret!) as IPatientAccessToken;
    }

    console.log(payload);
  } catch (err) {
    return next(
      new APIError({
        message: err.message,
        errors: [],
        stack: err.stack,
        status: httpStatus.UNAUTHORIZED,
      })
    );
  }

  next();
};