import { Request, Response, NextFunction } from "express";
import Doctor from "../../../models/doctor.model";
import { ITransformedDoctor, IDoctorUpdateSuccess } from "../../../types";
import APIError from "../../../errors/api-error";

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

// Get doctor by ID
export const getDoctorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctor = await Doctor.get(req.params.doctorId);
    res.json(doctor.transform());
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
    const updateFields = req.body;
    const doctor = await Doctor.get(req.params.doctorId);

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
    const doctor = await Doctor.get(req.params.doctorId);
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
