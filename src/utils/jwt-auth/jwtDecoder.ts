import { decode, verify } from "jsonwebtoken";
import env from "../../config/env";
import { IRefreshToken } from "types";

export const decodedDoctorPayload = (token: string): IRefreshToken => {
  const payload: IRefreshToken = verify(
    token,
    env.doctorRefreshTokenSecret!
  ) as IRefreshToken;
  return payload;
};

export const decodedPatientPayload = (token: string): IRefreshToken => {
  const payload: IRefreshToken = decode(
    token
  ) as IRefreshToken;
  return payload;
};