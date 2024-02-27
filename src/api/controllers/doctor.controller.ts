import { Request, Response, NextFunction } from "express";
import Doctor from "../../models/doctor.model";
import { ITransformedDoctor } from "../../types";

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

// Register a new doctor
export const registerDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.json(savedDoctor.transform());
  } catch (error) {
    console.error(error.code);
    next(Doctor.checkDuplicateFields(error));
  }
};
