import { sign, verify } from "jsonwebtoken";
import env from "../config/env";
import { IResetPasswordToken} from "../types";

export const generateResetPasswordToken = (
  options: IResetPasswordToken
) => {
  return sign(
    {
      id: options.id,
    },
    env.passwordResetTokenSecret!,
    {
      expiresIn: env.passwordResetTokenExpIn,
    }
  );
};

export const decodeResetPasswordToken = (
  token: string
): IResetPasswordToken => {
  const payload: IResetPasswordToken = verify(
    token,
    env.passwordResetTokenSecret!
  ) as IResetPasswordToken;

  return payload;
};
