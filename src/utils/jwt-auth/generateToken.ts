import { sign } from "jsonwebtoken";
import env from "../../config/env";
import { IDoctorAccessToken, IPatientAccessToken, IRefreshToken } from "../../types";

export const createDoctorAccessToken = (options: IDoctorAccessToken) => {
  return sign(
    {
      id: options?.id,
      email: options?.email,
      isEmailVerified: options?.isEmailVerified,
      isSlmcVerified: options?.isSlmcVerified,
      designation: options?.designation,
      imgUrl: options?.imgUrl,
    },
    env.doctorAccessTokenSecret!,
    {
      expiresIn: env.accessTokenExpIn,
    }
  );
};

export const createDoctorRefreshToken = (options: IRefreshToken) => {
  return sign(
    {
      id: options?.id,
    },
    env.doctorRefreshTokenSecret!,
    {
      expiresIn: env.refreshTokenExpIn,
    }
  );
};

export const createPatientAccessToken = (options: IPatientAccessToken) => {
  return sign(
    {
      id: options?.id,
      email: options?.email,
      isEmailVerified: options?.isEmailVerified,
      imgUrl: options?.imgUrl,
    },
    env.patientAccessTokenSecret!,
    {
      expiresIn: env.accessTokenExpIn,
    }
  );
};

export const createPatientRefreshToken = (options: IRefreshToken) => {
  return sign(
    {
      id: options?.id,
    },
    env.patientRefreshTokenSecret!,
    {
      expiresIn: env.refreshTokenExpIn,
    }
  );
};
