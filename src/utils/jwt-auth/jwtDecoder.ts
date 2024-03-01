import { verify } from "jsonwebtoken";
import env from "../../config/env";
import { IRefreshToken } from "types";

export const decodedPayload = (token: string): IRefreshToken => {
  const payload: IRefreshToken = verify(
    token,
    env.refreshTokenSecret!
  ) as IRefreshToken;
  return payload;
};
