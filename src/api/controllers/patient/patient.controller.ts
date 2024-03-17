import { Request, Response, NextFunction } from "express";
import Patient from "../../../models/patient.model";
import { ITransformedPatient, IPatientUpdateSuccess } from "../../../types";
import APIError from "../../../errors/api-error";
import { decodedPatientPayload } from "./../../../utils/jwt-auth/jwtDecoder";

// Test auth
export const testAuth = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      message: "Access granted",
    });
  } catch (error) {
    next(error);
  }
};

// Get the list of patient
export const getPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patient = await Patient.list(req.query);
    const transformedPatient = patient.map((patient: ITransformedPatient) =>
      patient.transform()
    );
    res.json(transformedPatient);
  } catch (error) {
    next(error);
  }
};

// Get patient by ID
export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patient = await Patient.get(req.params.patientId);
    console.log(patient);
    res.json(patient.transform());
  } catch (error) {
    next(error);
  }
};

// Update additional details
export const updatePatientDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IPatientUpdateSuccess> => {
  try {
    const updateFields = req.body;
    const token = req.headers["authorization"]?.split(" ")[1];
    console.log(token);
    const decodedToken = decodedPatientPayload(token as string);
    console.log(decodedToken);
    const patient = await Patient.get(decodedToken.id);

    if (patient) {
      try {
        patient.set(updateFields);
        await patient.save();
        res.json({
          message: "Patient updated successfully!",
          updatedFieldNames: Object.keys(updateFields),
        });
      } catch (error) {
        next(Patient.checkDuplicateFields(error));
      }
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
    next(Patient.checkDuplicateFields(error));
  }
  return {
    message: "",
    updatedFieldNames: [""],
  };
};

// Update patient password field
export const updatePatientPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const { oldPassword, newPassword } = req.body;
    if (patient) {
      if (await patient.passwordMatches(oldPassword, patient.password)) {
        patient.password = newPassword;
        await patient.save();
        res.json({
          message: "Password updated successfully!",
        });
      } else {
        throw new APIError({
          message: "Password does not match",
          status: 400,
          errors: [
            {
              field: "Password",
              location: "body",
              messages: ["Password does not match"],
            },
          ],
          stack: "",
        });
      }
    } else {
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
  } catch (error) {
    next(error);
  }
};
