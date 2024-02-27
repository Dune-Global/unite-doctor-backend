import { Request, Response, NextFunction } from "express";
import Doctor from "../../models/doctor.model";
import { v4 as uuidv4 } from "uuid";
import { ITransformedDoctor } from "../../types";

export const getDoctors = async (req: Request, res: Response) => {
  const doctors = await Doctor.list(req.query);
  const transformedDoctors = doctors.map((doctor: ITransformedDoctor) =>
    doctor.transform()
  );
  res.json(transformedDoctors);
};

export const createDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctor = new Doctor(req.body);
    doctor.isEmailVerified = false;
    const token = uuidv4();
    const savedDoctor = await doctor.save();
    doctor.password = token;
    res.json(savedDoctor.transform());
  } catch (error) {
    const handledError = Doctor.checkDuplicateEmail(error);
    next(handledError);
  }
};
