import { sign } from "jsonwebtoken";
import env from "../config/env";
import { IAccessToken, IRefreshToken } from "types";

export const createAccessToken = (options: IAccessToken) => {
  return sign(
    {
      id: options?.id,
      email: options?.email,
      isEmailVerified: options?.isEmailVerified,
      isSlmcVerified: options?.isSlmcVerified,
    },
    env.accessTokenSecret!,
    {
      expiresIn: env.accessTokenExpIn,
    }
  );
};

export const createRefreshToken = (options: IRefreshToken) => {
  return sign(
    {
      id: options?.id,
    },
    env.refreshTokenSecret!,
    {
      expiresIn: env.refreshTokenExpIn,
    }
  );
};
