import { generateResetPasswordToken } from "./../../../utils/resetPasswordToken";
import { Request, Response, NextFunction } from "express";
import Doctor from "../../../models/doctor.model";
import { defaultProfileImage } from "../../../utils/defaultProfileImage";
import {
  sendDoctorAccountActivationMail,
  sendDoctorResetPasswordMail,
} from "../../../utils/sendMail";
import {
  decodeAccountActivationToken,
  generateAccountActivationToken,
} from "../../../utils/accountActivationToken";
import env from "../../../config/env";
import APIError from "../../../errors/api-error";
import { decodeResetPasswordToken } from "../../../utils/resetPasswordToken";
import { decodedDoctorPayload } from "../../../utils/jwt-auth/jwtDecoder";

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
    const mailSendDetails = await sendDoctorAccountActivationMail(
      savedDoctor.email,
      "Account Activation",
      `${env.fontendUrl}activate-account/${savedDoctor.firstName}${savedDoctor.lastName}?at=${accountActivationToken}`,
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

export const getVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    if (doctor.isEmailVerified === true) {
      throw new APIError({
        message: "Email already verified",
        status: 404,
        errors: [
          {
            field: "email",
            location: "",
            messages: ["Email already verified"],
          },
        ],
        stack: "",
      });
    } else {
      let accountActivationTokenDetails: string;
      const accountActivationToken = generateAccountActivationToken({
        id: doctor.id,
      });

      const mailSendDetails = await sendDoctorAccountActivationMail(
        doctor.email,
        "Account Activation",
        `${env.fontendUrl}activate-account/${doctor.firstName}${doctor.lastName}?at=${accountActivationToken}`,
        doctor.firstName,
        doctor.lastName
      );

      if (env.isDev) {
        accountActivationTokenDetails = accountActivationToken;
      } else {
        accountActivationTokenDetails =
          "Token has been sent to your email address";
      }

      res.json({
        data: doctor.transform(),
        emailConfirmation: {
          message: "An email has been sent to your email address",
          data: mailSendDetails,
          tokenInfo: accountActivationTokenDetails,
        },
      });
    }
  } catch (error) {
    next(error);
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
    const token = req.headers["authorization"]?.split(" ")[1];
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
    req.app.locals.resetSession = true; // session start
    req.app.locals.id;
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

    req.app.locals.id = doctor.id;

    const resetPasswordToken = generateResetPasswordToken({
      id: doctor.id,
    });

    const mailSendDetails = await sendDoctorResetPasswordMail(
      doctor.email,
      "Account Activation",
      `${env.fontendUrl}activate-account/${doctor.firstName}${doctor.lastName}?rp=${resetPasswordToken}`,
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
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodeResetPasswordToken(token as string);
    const doctor = await Doctor.get(decodedToken.id);
    if (
      req.app.locals.resetSession === false ||
      doctor.id != req.app.locals.id
    ) {
      throw new APIError({
        message: "Unauthorized",
        status: 401,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Unauthorized"],
          },
        ],
        stack: "",
      });
    }

    if (doctor) {
      req.app.locals.resetSession = true;
      req.app.locals.isAuthDoctor = true;
      return res.json({
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
    return next(error);
  }
};

// validate the token from bearer token and update the password
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.app.locals.resetSession === false ||
      req.app.locals.isAuthDoctor === false
    ) {
      throw new APIError({
        message: "Unauthorized",
        status: 401,
        errors: [
          {
            field: "Authorization",
            location: "Header",
            messages: ["Unauthorized"],
          },
        ],
        stack: "",
      });
    }

    const token = req.headers["authorization"]?.split(" ")[1];
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

      req.app.locals.isAuthDoctor = false;
      req.app.locals.resetSession = false;
      req.app.locals.id = "";

      return res.json({
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
    return next(error);
  }
};
