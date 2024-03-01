import { sign, verify } from "jsonwebtoken";
import env from "../config/env";
import { IAccountActivationToken } from "../types";

export const generateAccountActivationToken = (options: IAccountActivationToken) => {
  return sign(
    {
      id: options.id,
    },
    env.accountActivationTokenSecret!,
    {
      expiresIn: env.accountActivationTokenExpIn,
    }
  );
};

export const decodeAccountActivationToken = (
  token: string
): IAccountActivationToken => {
  const payload: IAccountActivationToken = verify(
    token,
    env.accountActivationTokenSecret!
  ) as IAccountActivationToken;

  return payload;
};
