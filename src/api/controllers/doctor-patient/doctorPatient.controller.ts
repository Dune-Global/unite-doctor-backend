import { Request, Response, NextFunction } from "express";
import PatientSession from "./../../../models/patientSession.model";
import Patient from "./../../../models/patient.model";
import Doctor from "./../../../models/doctor.model";
import {
  decodedPatientPayload,
  decodedDoctorPayload,
} from "./../../../utils/jwt-auth/jwtDecoder";
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
            field: "Patient-Doctor",
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
      message: `Connected to Dr. ${doctor.firstName} ${doctor.lastName} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const addPrescription = async (req: Request, res: Response) => {
  const { prescription } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);
    const patientId = req.params.patientId;
    const patient = await Patient.get(patientId);

    // Find the session with the given doctorId and patientId
    const session = await PatientSession.findOne({
      doctor: doctor._id,
      patient: patient._id,
    });

    if (!session) {
      throw new APIError({
        message: `Patient not connected with doctor`,
        status: 404,
        errors: [
          {
            field: "Patient-Doctor",
            location: "body",
            messages: [`Patient not connected with doctor`],
          },
        ],
        stack: "",
      });
    }

    // Update the session
    const updatedPatientSession = await PatientSession.findByIdAndUpdate(
      session._id,
      { $push: { prescription: prescription } },
      { new: true }
    );

    res.status(200).json(updatedPatientSession);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating PatientSession", error: err });
  }
};

export const getDoctorPatientDetail = async (req: Request, res: Response) => {
  const patientSessionId = req.params.patientSessionId;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = decodedDoctorPayload(token as string);

  try {
    const userId = decodedToken.id;
    const doctor = await Doctor.findOne({ _id: userId });
    const patient = await Patient.findOne({ _id: userId });

    let session;

    if (doctor) {
      session = await PatientSession.findOneAndUpdate(
        { _id: patientSessionId, doctor: doctor._id },
        { doctorLastAccessedDate: new Date() },
        { new: true }
      );
    } else if (patient) {
      session = await PatientSession.findOne({
        _id: patientSessionId,
        patient: patient._id,
      });
    }

    if (!session) {
      throw new APIError({
        message: `Session does not belong to you`,
        status: 403,
        errors: [
          {
            field: "Patient-Doctor",
            location: "body",
            messages: [`Session does not belong to you`],
          },
        ],
        stack: "",
      });
    }

    res.status(200).json(session);
  } catch (err) {
    throw new APIError({
      message: err.message,
      status: 500,
      errors: [
        {
          field: "Patient-Doctor",
          location: "",
          messages: [],
        },
      ],
      stack: "",
    });
  }
};

export const getConnectedPatients = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);
    const connectedPatients = await PatientSession.find({
      doctor: doctor,
    }).populate("patient");

    const response = connectedPatients.map((session) => ({
      sessionId: session._id,
      patient: session.patient,
    }));

    res.status(200).json(response);
  } catch (err) {
    throw new APIError({
      message: err.message,
      status: 500,
      errors: [
        {
          field: "Patient-Doctor",
          location: "",
          messages: [],
        },
      ],
      stack: "",
    });
  }
};

export const getConnectedDoctors = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const connectedDoctors = await PatientSession.find({ patient: patient }).populate('doctor');

    const response = connectedDoctors.map((session) => ({
      sessionId: session._id,
      doctor: {
        firstname: session.doctor.firstName,
        lastname: session.doctor.lastName,
        designation: session.doctor.designation,
        gender: session.doctor.gender,
        email: session.doctor.email,
        doctorLastAccessedDate: session.doctorLastAccessedDate,
      },
    }));

    res.status(200).json(response);
  } catch (err) {
    throw new APIError({
      message: err.message,
      status: 500,
      errors: [
        {
          field: "Patient-Doctor",
          location: "",
          messages: [],
        },
      ],
      stack: "",
    });
  }
};
