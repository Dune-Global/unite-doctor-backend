import { Request, Response, NextFunction } from "express";
import Doctor from "../../../models/doctor.model";
import Patient from "../../../models/patient.model";
import PatientSession from "../../../models/patientSession.model";
import { ITransformedDoctor, IDoctorUpdateSuccess } from "../../../types";
import APIError from "../../../errors/api-error";
import { decodedDoctorPayload } from "./../../../utils/jwt-auth/jwtDecoder";

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

// Get the list of doctors
export const getDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctors = await Doctor.list(req.query);
    const transformedDoctors = doctors.map((doctor: ITransformedDoctor) =>
      doctor.transform()
    );
    res.json(transformedDoctors);
  } catch (error) {
    next(error);
  }
};

// Update additional details
export const updateDoctorDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IDoctorUpdateSuccess> => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decoded = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decoded.id);
    const updateFields = req.body;

    if (doctor) {
      try {
        doctor.set(updateFields);
        await doctor.save();
        res.json({
          message: "Doctor updated successfully!",
          updatedFieldNames: Object.keys(updateFields),
        });
      } catch (error) {
        next(Doctor.checkDuplicateFields(error));
      }
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
    next(Doctor.checkDuplicateFields(error));
  }
  return {
    message: "",
    updatedFieldNames: [""],
  };
};

// Update doctor password field
export const updateDoctorPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decoded = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decoded.id);
    const { oldPassword, newPassword } = req.body;
    if (doctor) {
      if (await doctor.passwordMatches(oldPassword, doctor.password)) {
        doctor.password = newPassword;
        await doctor.save();
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
  } catch (error) {
    next(error);
  }
};

// Get doctor by ID
export const getDoctorById = async (
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

    if (doctor) {
      if (doctor._id.toString() !== req.params.doctorId) {
        throw new APIError({
          message: "You are not authorized to access this doctor",
          status: 400,
          errors: [
            {
              field: "Doctor",
              location: "params",
              messages: ["You are not authorized to access this doctor"],
            },
          ],
          stack: "",
        });
      }
      res.json(doctor.transform());
    } else if (patient) {
      const reqDoctor = await Doctor.findOne({
        _id: req.params.doctorId,
      }).select("-__v -dateOfBirth -nicNumber -password -isEmailVerified");

      // Check if the doctor exists
      if (!reqDoctor) {
        throw new APIError({
          message: `Doctor not found`,
          status: 404,
          errors: [
            {
              field: "Doctor",
              location: "params",
              messages: [`Doctor not found`],
            },
          ],
          stack: "",
        });
      }

      session = await PatientSession.findOne({
        doctor: reqDoctor._id,
        patient: patient._id,
        status: "connected",
      });

      if (!session) {
        throw new APIError({
          message: "You are not authorized to access this doctor",
          status: 400,
          errors: [
            {
              field: "Doctor",
              location: "params",
              messages: ["You are not authorized to access this doctor"],
            },
          ],
          stack: "",
        });
      }

      res.json(reqDoctor).status(200);
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

export const getDocBasicById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const docId = req.params.doctorId;
    const doctor = await Doctor.findOne({ _id: docId }).select(
      "firstName lastName designation"
    );
    if (!doctor) {
      throw new APIError({
        message: "Doctor not found",
        status: 404,
        errors: [
          {
            field: "Doctor",
            location: "params",
            messages: ["Doctor not found"],
          },
        ],
        stack: "",
      });
    }
    res.json(doctor);
  } catch (error) {
    next(error);
  }
};
