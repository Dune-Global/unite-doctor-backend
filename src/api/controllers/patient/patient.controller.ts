import { Request, Response, NextFunction } from "express";
import Patient from "../../../models/patient.model";
import Doctor from "../../../models/doctor.model";
import PatientSession from "../../../models/patientSession.model";
import { ITransformedPatient, IPatientUpdateSuccess } from "../../../types";
import APIError from "../../../errors/api-error";
import {
  decodedDoctorPayload,
  decodedPatientPayload,
} from "./../../../utils/jwt-auth/jwtDecoder";

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
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = decodedDoctorPayload(token as string);
  try {
    const userId = decodedToken.id;
    const doctor = await Doctor.findOne({ _id: userId });
    const patient = await Patient.findOne({ _id: userId });

    let session;

    if (patient) {
      if (patient._id.toString() !== req.params.patientId) {
        throw new APIError({
          message: "You are not authorized to access this patient",
          status: 401,
          errors: [
            {
              field: "Patient",
              location: "params",
              messages: ["You are not authorized to access this patient"],
            },
          ],
          stack: "",
        });
      }
      res.json(patient.transform());
    } else if (doctor) {
      const reqPatient = await Patient.findOne({
        _id: req.params.patientId,
      }).select("-__v -nicNumber -password -isEmailVerified");

      // Check if the patient exists
      if (!reqPatient) {
        throw new APIError({
          message: `Patient not found`,
          status: 404,
          errors: [
            {
              field: "Patient",
              location: "params",
              messages: [`Patient not found`],
            },
          ],
          stack: "",
        });
      }

      session = await PatientSession.findOne({
        doctor: doctor._id,
        patient: reqPatient._id,
        status: "connected",
      });

      if (!session) {
        throw new APIError({
          message: "You are not authorized to access this patient",
          status: 401,
          errors: [
            {
              field: "Patient",
              location: "params",
              messages: ["You are not authorized to access this patient"],
            },
          ],
          stack: "",
        });
      }

      res.json(reqPatient).status(200);
    } else {
      throw new APIError({
        message: "User does not exist",
        status: 404,
        errors: [
          {
            field: "User",
            location: "body",
            messages: ["User does not exist"],
          },
        ],
        stack: "",
      });
    }
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
    const decodedToken = decodedPatientPayload(token as string);
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
