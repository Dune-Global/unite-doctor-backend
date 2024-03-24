import { generateResetPasswordToken } from "./../../../utils/resetPasswordToken";
import { Request, Response, NextFunction } from "express";
import Patient from "../../../models/patient.model";
import { defaultProfileImage } from "../../../utils/defaultProfileImage";
import {
  sendPatientAccountActivationMail,
  sendPatientResetPasswordMail,
} from "../../../utils/sendMail";
import {
  decodeAccountActivationToken,
  generateAccountActivationToken,
} from "../../../utils/accountActivationToken";
import env from "../../../config/env";
import APIError from "../../../errors/api-error";
import { decodeResetPasswordToken } from "../../../utils/resetPasswordToken";
import { decodedPatientPayload } from "./../../../utils/jwt-auth/jwtDecoder";

// Register a new patient
export const registerPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let accountActivationTokenDetails: string;

    const { firstName, lastName, imgUrl, ...otherFields } = req.body;

    const constructedImgUrl = defaultProfileImage(firstName, lastName);

    const patient = new Patient({
      firstName,
      lastName,
      imgUrl: constructedImgUrl,
      ...otherFields,
    });

    const savedPatient = await patient.save();

    const accountActivationToken = generateAccountActivationToken({
      id: savedPatient.id,
    });

    const mailSendDetails = await sendPatientAccountActivationMail(
      savedPatient.email,
      "Account Activation",
      `${env.patientFrontendUrl}activate-account/${savedPatient.firstName}${savedPatient.lastName}?at=${accountActivationToken}`,
      savedPatient.firstName,
      savedPatient.lastName
    );

    if (env.isDev) {
      accountActivationTokenDetails = accountActivationToken;
    } else {
      accountActivationTokenDetails =
        "Token has been sent to your email address";
    }

    res.json({
      data: savedPatient.transform(),
      emailConfirmation: {
        message: "An email has been sent to your email address",
        data: mailSendDetails,
        tokenInfo: accountActivationTokenDetails,
      },
    });
  } catch (error) {
    console.error(error.code);
    next(Patient.checkDuplicateFields(error));
  }
};

export const getVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    if (patient.isEmailVerified === true) {
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
        id: patient.id,
      });

      const mailSendDetails = await sendPatientAccountActivationMail(
        patient.email,
        "Account Activation",
        `${env.patientFrontendUrl}activate-account/${patient.firstName}${patient.lastName}?at=${accountActivationToken}`,
        patient.firstName,
        patient.lastName
      );

      if (env.isDev) {
        accountActivationTokenDetails = accountActivationToken;
      } else {
        accountActivationTokenDetails =
          "Token has been sent to your email address";
      }

      res.json({
        data: patient.transform(),
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

// Patient login
export const loginPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { accessToken, refreshToken } = await Patient.findAndGenerateToken({
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
    const patient = await Patient.get(decodedToken.id);

    if (patient) {
      patient.isEmailVerified = true;
      await patient.save();
      res.json({
        message: "Account activated successfully!",
      });
    }

    throw new APIError({
      message: "Patient does not exist",
      status: 404,
      errors: [
        {
          field: "Patient",
          location: "body",
          messages: ["Patient does not exist"],
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
        status: 400,
        stack: "",
      });
    }

    const patient = await Patient.findOne({
      email: email,
    });

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "body",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    req.app.locals.id = patient.id;

    const resetPasswordToken = generateResetPasswordToken({
      id: patient.id,
    });

    const mailSendDetails = await sendPatientResetPasswordMail(
      patient.email,
      "Account Activation",
      `${env.patientFrontendUrl}activate-account/${patient.firstName}${patient.lastName}?rp=${resetPasswordToken}`,
      patient.firstName,
      patient.lastName
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
    const patient = await Patient.get(decodedToken.id);
    if (
      req.app.locals.resetSession === false ||
      patient.id != req.app.locals.id
    ) {
      throw new APIError({
        message: "Unauthorized",
        status: 400,
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

    if (patient) {
      req.app.locals.resetSession = true;
      req.app.locals.isAuthPatient = true;
      return res.json({
        message: "Authenticated reset password token!",
      });
    }

    throw new APIError({
      message: "Patient does not exist",
      status: 404,
      errors: [
        {
          field: "Patient",
          location: "body",
          messages: ["Patient does not exist"],
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
      req.app.locals.isAuthPatient === false
    ) {
      throw new APIError({
        message: "Unauthorized",
        status: 400,
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
    const patient = await Patient.get(decodedToken.id);

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

    if (patient) {
      if (patient.password === newPassword) {
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

      patient.password = newPassword;
      await patient.save();

      req.app.locals.isAuthPatient = false;
      req.app.locals.resetSession = false;
      req.app.locals.id = "";

      return res.json({
        message: "Password reset successfully!",
      });
    }

    throw new APIError({
      message: "Patient does not exist",
      status: 404,
      errors: [
        {
          field: "Patient",
          location: "body",
          messages: ["Patient does not exist"],
        },
      ],
      stack: "",
    });
  } catch (error) {
    return next(error);
  }
};
