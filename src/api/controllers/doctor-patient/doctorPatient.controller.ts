import { Request, Response, NextFunction } from "express";
import PatientSession from "./../../../models/patientSession.model";
import Patient from "./../../../models/patient.model";
import Doctor from "./../../../models/doctor.model";
import { decodedPatientPayload } from "./../../../utils/jwt-auth/jwtDecoder";
import APIError from "./../../../errors/api-error";

export const connectPatientDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const doctor = await Doctor.get(req.params.doctorId);

    // Check if a session already exists
    const existingSession = await PatientSession.findOne({
      patient: patient,
      doctor: doctor,
    });

    if (existingSession) {
      // If a session already exists, return a message
      throw new APIError({
        message: `Already Connected with Dr. ${doctor.firstName} ${doctor.lastName}`,
        status: 409,
        errors: [
          {
            field: "Patient",
            location: "body",
            messages: [
              `Already Connected with Dr. ${doctor.firstName} ${doctor.lastName}`,
            ],
          },
        ],
        stack: "",
      });
    }

    const patientSession = new PatientSession({
      patient: patient as any,
      doctor: doctor as any,
    });

    await patientSession.save();

    res.status(200).json({
      message: `Connected to Dr. ${doctor.firstName} ${doctor.lastName}successfully`,
    });
  } catch (error) {
    next(error);
  }
};
