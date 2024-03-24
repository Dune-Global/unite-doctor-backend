import { Request, Response, NextFunction } from "express";
import PatientSession from "./../../../models/patientSession.model";
import Patient from "./../../../models/patient.model";
import Doctor from "./../../../models/doctor.model";
import {
  decodedPatientPayload,
  decodedDoctorPayload,
} from "./../../../utils/jwt-auth/jwtDecoder";
import APIError from "./../../../errors/api-error";
import {
  Appointment,
  DoctorAvailability,
} from "./../../../models/appointment.model";

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

    // Check if the doctor exists
    if (!doctor) {
      throw new APIError({
        message: `Invalid QR code`,
        status: 400,
        errors: [
          {
            field: "Doctor",
            location: "params",
            messages: [`Invalid QR code`],
          },
        ],
        stack: "",
      });
    }

    // Check if a session already exists
    const existingSession = await PatientSession.findOne({
      patient: patient,
      doctor: doctor,
    });

    if (existingSession && existingSession.status === "connected") {
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
    } else if (existingSession && existingSession.status === "disconnected") {
      // If a session already exists, update the status to connected
      await PatientSession.findByIdAndUpdate(existingSession._id, {
        status: "connected",
      });
      res.status(200).json({
        message: `Connected to Dr. ${doctor.firstName} ${doctor.lastName} successfully`,
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

export const disconnectPatientDoc = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const doctor = await Doctor.get(req.params.doctorId);

    // Check if the doctor exists
    if (!doctor) {
      throw new APIError({
        message: `Invalid QR code`,
        status: 400,
        errors: [
          {
            field: "Doctor",
            location: "params",
            messages: [`Invalid QR code`],
          },
        ],
        stack: "",
      });
    }

    // Check if a session already exists
    const existingSession = await PatientSession.findOne({
      patient: patient,
      doctor: doctor,
      status: "connected",
    });

    if (!existingSession) {
      throw new APIError({
        message: `Not connected with Dr. ${doctor.firstName} ${doctor.lastName}`,
        status: 404,
        errors: [
          {
            field: "Patient-Doctor",
            location: "body",
            messages: [
              `Not connected with Dr. ${doctor.firstName} ${doctor.lastName}`,
            ],
          },
        ],
        stack: "",
      });
    }

    await PatientSession.findByIdAndUpdate(existingSession._id, {
      status: "disconnected",
    });

    res.status(200).json({
      message: `Disconnected from Dr. ${doctor.firstName} ${doctor.lastName} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const addPrescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      status: "connected",
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
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedPatientSession);
  } catch (err) {
    next(err);
  }
};

export const getDoctorPatientDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const patientSessionId = req.params.patientSessionId;
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = decodedDoctorPayload(token as string);

  try {
    const userId = decodedToken.id;
    const doctor = await Doctor.findOne({ _id: userId });
    const patient = await Patient.findOne({ _id: userId });

    const session = await PatientSession.findOne({
      _id: patientSessionId,
    });

    if (!session) {
      throw new APIError({
        message: `Session not found`,
        status: 403,
        errors: [
          {
            field: "Patient-Doctor",
            location: "params",
            messages: [`Session not found`],
          },
        ],
        stack: "",
      });
    }

    if (doctor) {
      if (
        doctor._id.toString() !== session.doctor.toString() &&
        !session.allowedDoctorsToViewThisDoctorsSessionDetails.some(
          (doc) => doc.doctorId.toString() === doctor._id.toString()
        )
      ) {
        throw new APIError({
          message: `You are not authorized to access this session`,
          status: 400,
          errors: [
            {
              field: "Doctor",
              location: "params",
              messages: [`You are not authorized to access this session`],
            },
          ],
          stack: "",
        });
      } else if (doctor._id.toString() === session.doctor.toString()) {
        await PatientSession.findByIdAndUpdate(session._id, {
          doctorLastAccessedDate: new Date(),
        });
      } else if (
        session.allowedDoctorsToViewThisDoctorsSessionDetails.some(
          (doc) => doc.doctorId.toString() === doctor._id.toString()
        )
      ) {
        await PatientSession.findOneAndUpdate(
          {
            _id: session._id,
            "allowedDoctorsToViewThisDoctorsSessionDetails.doctorId":
              doctor._id,
          },
          {
            $set: {
              "allowedDoctorsToViewThisDoctorsSessionDetails.$.informationLastAccessDate":
                new Date(),
            },
          }
        );
      }
    } else if (patient) {
      if (patient._id.toString() !== session.patient.toString()) {
        throw new APIError({
          message: `You are not authorized to access this session`,
          status: 400,
          errors: [
            {
              field: "Patient",
              location: "params",
              messages: [`You are not authorized to access this session`],
            },
          ],
          stack: "",
        });
      }
    }

    session.prescription.sort((a, b) => {
      return (
        new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
      );
    });

    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

export const getConnectedPatients = async (
  req: Request,
  res: Response,
  next: NewableFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);
    const connectedPatients = await PatientSession.find({
      doctor: doctor,
      status: "connected",
    }).exec();

    const response = await Promise.all(
      connectedPatients.map(async (session) => {
        const patient = await Patient.findById(session.patient)
          .select("-password -__v")
          .lean();

        return {
          sessionId: session._id,
          patient: patient,
          status: "connected",
        };
      })
    );
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const getConnectedDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient: any = await Patient.get(decodedToken.id);

    const connectedDoctors: any = await PatientSession.find({
      patient: patient,
    }).populate("doctor");

    const response = connectedDoctors.map((session: any) => ({
      sessionId: session._id,
      doctor: {
        id: session.doctor._id,
        firstName: session.doctor.firstName,
        lastName: session.doctor.lastName,
        designation: session.doctor.designation,
        gender: session.doctor.gender,
        email: session.doctor.email,
        doctorLastAccessedDate: session.doctorLastAccessedDate,
        imgUrl: session.doctor.imgUrl,
      },
      status: session.status,
    }));

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const getSharedDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);
    const patient = await Patient.get(req.params.patientId);

    const patientSessions = await PatientSession.find({
      patient: patient,
    });

    const sharedDoctors = patientSessions.filter((session) =>
      session.allowedDoctorsToViewThisDoctorsSessionDetails.some(
        (doc) => doc.doctorId.toString() === doctor._id.toString()
      )
    );

    async function getDoctorById(id: string) {
      return await Doctor.findById(id);
    }

    const response = await Promise.all(
      sharedDoctors.map(async (session) => {
        const doctor = await getDoctorById(session.doctor);
        if (!doctor) {
          throw new Error(`No doctor found with id ${session.doctor}`);
        }
        return {
          sessionId: session._id,
          doctorId: session.doctor,
          doctorDetails: {
            id: doctor._id,
            doctorName: `${doctor.firstName} ${doctor.lastName}`,
            speciality: doctor.designation,
            email: doctor.email,
            contactNUmber: doctor.mobile,
            firstName: doctor.firstName,
            lastName: doctor.lastName,
            designation: doctor.designation,
            imgUrl: doctor.imgUrl,
          },
        };
      })
    );

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const permissionsForDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    const sessionNeedToShare = await PatientSession.findOne({
      patient: patient,
      _id: req.params.patientSessionId,
    });

    if (!sessionNeedToShare) {
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

    if (sessionNeedToShare.doctor.toString() === req.body.doctorId) {
      throw new APIError({
        message: `This doctor already has permission`,
        status: 409,
        errors: [
          {
            field: "Patient-Doctor",
            location: "body",
            messages: [`This doctor already has permission`],
          },
        ],
        stack: "",
      });
    }

    const patientsDoctorList = await PatientSession.find({
      patient: patient._id,
      doctor: { $ne: sessionNeedToShare.doctor }, // exclude the doctor who owns the session
    });

    let doctorsIdList = patientsDoctorList.map((session) => session.doctor);

    let allowedDoctors = await Promise.all(
      doctorsIdList.map(async (doctorId) => {
        let allowed = false;
        let informationLastAccessDate = null;

        for (let allowedDoctor of sessionNeedToShare.allowedDoctorsToViewThisDoctorsSessionDetails) {
          if (allowedDoctor.doctorId.toString() === doctorId.toString()) {
            allowed = true;
            informationLastAccessDate = allowedDoctor.informationLastAccessDate;
            break;
          }
        }

        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
          throw new Error("Doctor not found");
        }

        return {
          doctorId,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          designation: doctor.designation,
          imgUrl: doctor.imgUrl,
          informationLastAccessDate,
          allowed,
        };
      })
    );

    res.status(200).json({ allowedDoctors });
  } catch (error) {
    next(error);
  }
};

export const updateSharedDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const { allowedDoctors } = req.body;

    const session = await PatientSession.findOne({
      patient: patient,
      _id: req.params.patientSessionId,
    });

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

    const patientsDoctorList = await PatientSession.find({
      patient: patient._id,
      status: "connected",
    });

    let doctorsIdList = patientsDoctorList.map((session) =>
      session.doctor.toString()
    );

    let doctorsCurrentAccess =
      session.allowedDoctorsToViewThisDoctorsSessionDetails.map((doc) =>
        doc.doctorId.toString()
      );

    for (let doctor of allowedDoctors) {
      // Exclude the current session's doctor
      if (doctor.doctorId === session.doctor.toString()) {
        continue;
      }

      // Check if the doctor is connected to the patient
      if (!doctorsIdList.includes(doctor.doctorId)) {
        throw new APIError({
          message: `Doctor ${doctor.doctorId} is not connected to the patient`,
          status: 400,
          errors: [
            {
              field: "Doctor",
              location: "body",
              messages: [`Doctor is not connected to the patient`],
            },
          ],
          stack: "",
        });
      }

      if (doctor.allowed && !doctorsCurrentAccess.includes(doctor.doctorId)) {
        // Doctor is allowed and not already in the array, so add them
        doctorsCurrentAccess.push(doctor.doctorId);
      } else if (!doctor.allowed) {
        // Doctor is not allowed, so remove them from the array if they are in it
        doctorsCurrentAccess = doctorsCurrentAccess.filter(
          (id) => id !== doctor.doctorId
        );
      }
    }

    // Update the session in the database
    await PatientSession.updateOne(
      { _id: session._id },
      {
        allowedDoctorsToViewThisDoctorsSessionDetails: doctorsCurrentAccess.map(
          (doctorId) => ({
            doctorId,
            informationLastAccessDate: null,
          })
        ),
      }
    );

    res.json({
      doctorsIdList,
      doctorsCurrentAccess,
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissionDoctors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    const session = await PatientSession.findOne({
      patient: patient,
      _id: req.params.patientSessionId,
    });

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

    const allowedDoctors =
      session.allowedDoctorsToViewThisDoctorsSessionDetails;
    const response = allowedDoctors.map((doc) => ({
      doctorId: doc.doctorId,
      informationLastAccessDate: doc.informationLastAccessDate,
    }));

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    const connectedPatients = await PatientSession.find({
      doctor: doctor,
      status: "connected",
    });

    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );
    const tomorrow = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    );

    const todayDoctorAvailabilities = await DoctorAvailability.find({
      doctorId: doctor._id,
      date: { $gte: today, $lt: tomorrow },
    });

    const todayAppointments = await Appointment.find({
      doctorAvailabilityId: {
        $in: todayDoctorAvailabilities.map((da) => da._id),
      },
      status: "Pending",
    }).populate({
      path: "patient",
      select: "imgUrl firstName lastName",
    });

    const genderCount = await Patient.aggregate([
      {
        $match: {
          _id: { $in: connectedPatients.map((p) => p.patient) },
        },
      },
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1,
        },
      },
    ]);

    const ageCount = await Patient.aggregate([
      {
        $match: {
          _id: { $in: connectedPatients.map((p) => p.patient) },
        },
      },
      {
        $group: {
          _id: { $year: "$dateOfBirth" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          type: { $toString: "$_id" },
          count: 1,
        },
      },
    ]);

    const response = {
      data: {
        connectedPatientsCount: connectedPatients.length,
        todayAppointmentsCount: todayAppointments.length,
        todayDoctorAvailabilities,
        todayAppointments: todayAppointments.map((appointment) => ({
          _id: appointment._id,
          appointmentNumber: appointment.appointmentNumber,
          status: appointment.status,
          patientImgUrl: (appointment.patient as any).imgUrl,
          patientFirstName: (appointment.patient as any).firstName,
          patientLastName: (appointment.patient as any).lastName,
        })),
        gender: genderCount,
        age: ageCount,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
