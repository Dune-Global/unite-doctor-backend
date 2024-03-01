import { generateResetPasswordToken } from "./../../../utils/resetPasswordToken";
import { Request, Response, NextFunction } from "express";
import Doctor from "../../../models/doctor.model";
import { defaultProfileImage } from "../../../utils/defaultProfileImage";
import { sendAccountActivationMail } from "../../../utils/sendMail";
import {
  decodeAccountActivationToken,
  generateAccountActivationToken,
} from "../../../utils/accountActivationToken";
import env from "../../../config/env";
import APIError from "../../../errors/api-error";
import { decodeResetPasswordToken } from "../../../utils/resetPasswordToken";

// Register a new doctor
export const registerDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accountActivationTokenDetails: string;

    const { firstName, lastName, imgUrl, ...otherFields } = req.body;

    const constructedImgUrl = defaultProfileImage(firstName, lastName);

    const doctor = new Doctor({
      firstName,
      lastName,
      imgUrl: constructedImgUrl,
      ...otherFields,
    });

    const savedDoctor = await doctor.save();
    const accountActivationToken = generateAccountActivationToken({
      id: savedDoctor.id,
    });
    const mailSendDetails = await sendAccountActivationMail(
      savedDoctor.email,
      "Account Activation",
      `${env.fontendUrl}activate-account/${savedDoctor.firstName}${savedDoctor.lastName}/at?${accountActivationToken}`,
      savedDoctor.firstName,
      savedDoctor.lastName
    );

    if (env.isDev) {
      accountActivationTokenDetails = accountActivationToken;
    } else {
      accountActivationTokenDetails =
        "Token has been sent to your email address";
    }

    res.json({
      data: savedDoctor.transform(),
      emailConfirmation: {
        message: "An email has been sent to your email address",
        data: mailSendDetails,
        tokenInfo: accountActivationTokenDetails,
      },
    });
  } catch (error) {
    console.error(error.code);
    next(Doctor.checkDuplicateFields(error));
  }
};

// Doctor login
export const loginDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await Doctor.findAndGenerateToken({
      email: req.body.email,
      password: req.body.password,
    });
    res.json({
      message: "Login Successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// Decode the account activation token & set the isEmailVerified field to true
export const activateAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const decodedToken = decodeAccountActivationToken(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    if (doctor) {
      doctor.isEmailVerified = true;
      await doctor.save();
      res.json({
        message: "Account activated successfully!",
      });
    }

    throw new APIError({
      message: "Doctor does not exist",
      status: 404,
      errors: [
        {
          field: "Doctor",
          location: "body",
          messages: ["Doctor does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password with the link provided in the email
export const sendResetPasswordEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let resetPasswordTokenDetails: string;
    const { email } = req.body;
    if (!email) {
      throw new APIError({
        message: "An email is required to reset the password",
        errors: [],
        status: 401,
        stack: "",
      });
    }

    const doctor = await Doctor.findOne({
      email: email,
    });

    if (!doctor) {
      throw new APIError({
        message: "Doctor does not exist",
        status: 404,
        errors: [
          {
            field: "Doctor",
            location: "body",
            messages: ["Doctor does not exist"],
          },
        ],
        stack: "",
      });
    }

    const resetPasswordToken = generateResetPasswordToken({
      id: doctor.id,
    });

    const mailSendDetails = await sendAccountActivationMail(
      doctor.email,
      "Account Activation",
      `${env.fontendUrl}activate-account/${doctor.firstName}${doctor.lastName}/rp?${resetPasswordToken}`,
      doctor.firstName,
      doctor.lastName
    );

    if (env.isDev) {
      resetPasswordTokenDetails = resetPasswordToken;
    } else {
      resetPasswordTokenDetails = "Token has been sent to your email address";
    }

    res.json({
      message: "An email has been sent to your email address",
      data: mailSendDetails,
      tokenInfo: resetPasswordTokenDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Validate reset password token
export const validateResetPasswordToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const decodedToken = decodeResetPasswordToken(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    if (doctor) {
      res.json({
        message: "Authenticated reset password token!",
      });
    }

    throw new APIError({
      message: "Doctor does not exist",
      status: 404,
      errors: [
        {
          field: "Doctor",
          location: "body",
          messages: ["Doctor does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    next(error);
  }
};

// validate the token from bearer token and update the password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const decodedToken = decodeResetPasswordToken(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    if (!newPassword) {
      throw new APIError({
        message: "Password cannot be empty",
        status: 400,
        errors: [
          {
            field: "Password",
            location: "body",
            messages: ["Password cannot be empty"],
          },
        ],
        stack: "",
      });
    }

    if (doctor) {
      if (doctor.password === newPassword) {
        throw new APIError({
          message: "Password cannot be the same as the current password",
          status: 400,
          errors: [
            {
              field: "Password",
              location: "body",
              messages: ["Password cannot be the same as the current password"],
            },
          ],
          stack: "",
        });
      }
      doctor.password = newPassword;
      await doctor.save();
      res.json({
        message: "Password reset successfully!",
      });
    }

    throw new APIError({
      message: "Doctor does not exist",
      status: 404,
      errors: [
        {
          field: "Doctor",
          location: "body",
          messages: ["Doctor does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    next(error);
  }
};
