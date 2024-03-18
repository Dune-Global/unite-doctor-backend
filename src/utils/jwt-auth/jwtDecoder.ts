import { decode } from "jsonwebtoken";
import { IRefreshToken } from "types";

export const decodedDoctorPayload = (token: string): IRefreshToken => {
  const payload: IRefreshToken = decode(
    token
  ) as IRefreshToken;
  return payload;
};

export const decodedPatientPayload = (token: string): IRefreshToken => {
  const payload: IRefreshToken = decode(
    token
  ) as IRefreshToken;
  return payload;
};