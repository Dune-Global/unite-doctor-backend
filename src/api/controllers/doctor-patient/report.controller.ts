import { NextFunction, Request, Response } from "express";
import Patient from "./../../../models/patient.model";
import Doctor from "./../../../models/doctor.model";
import Report from "./../../../models/report.model";
import patientSessionModel from "./../../../models/patientSession.model";
import APIError from "./../../../errors/api-error";
import {
  decodedPatientPayload,
  decodedDoctorPayload,
} from "./../../../utils/jwt-auth/jwtDecoder";

export const attachReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const { reportUrl, reportType, tookDate } = req.body;

    if (tookDate) {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (new Date(tookDate) > currentDate) {
        throw new APIError({
          message: "Took date should not be in the future",
          status: 400,
          errors: [
            {
              field: "date",
              location: "body",
              messages: ["Took date should not be in the future"],
            },
          ],
          stack: "",
        });
      }
    }

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "token",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    const newReport = new Report({
      reportType,
      tookDate,
      patient: patient,
      reportUrl,
    });

    await newReport.save();

    res.json({
      message: "Report Saved successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "token",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    const reports = await Report.find({ patient: patient._id }).sort({
      tookDate: -1,
    });

    res.json({
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorsWithAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "token",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      throw new APIError({
        message: "Report does not exist",
        status: 404,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["Report does not exist"],
          },
        ],
        stack: "",
      });
    }

    const patientsDoctorList = await patientSessionModel.find({
      patient: patient._id,
    });

    if (report.patient.toString() !== patient._id.toString()) {
      throw new APIError({
        message: "You are not authorized to access this report",
        status: 400,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["You are not authorized to access this report"],
          },
        ],
        stack: "",
      });
    }

    let doctorsIdList = patientsDoctorList.map((session) => session.doctor);

    let doctorsAllowed = await Promise.all(
      doctorsIdList.map(async (doctorId) => {
        let allowed = false;
        let informationLastAccessDate = null;

        for (let allowedDoctor of report.allowedDoctorsToView) {
          if (allowedDoctor.doctorId.toString() === doctorId.toString()) {
            allowed = true;
            informationLastAccessDate = allowedDoctor.informationLastAccessDate;
            break;
          }
        }

        // Fetch doctor's details from the database
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

    res.json({
      doctorsAllowed,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorsAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const { doctorsAllowed } = req.body;

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "token",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      throw new APIError({
        message: "Report does not exist",
        status: 404,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["Report does not exist"],
          },
        ],
        stack: "",
      });
    }

    if (report.patient.toString() !== patient._id.toString()) {
      throw new APIError({
        message: "You are not authorized to access this report",
        status: 400,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["You are not authorized to access this report"],
          },
        ],
        stack: "",
      });
    }

    const patientsDoctorList = await patientSessionModel.find({
      patient: patient._id,
    });

    let doctorsIdList = patientsDoctorList.map((session) => session.doctor);

    let doctorsCurrentAccess = report.allowedDoctorsToView.map((doc) =>
      doc.doctorId.toString()
    );

    for (let doctor of doctorsAllowed) {
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

    // Update the report in the database
    await Report.updateOne(
      { _id: report._id },
      {
        allowedDoctorsToView: doctorsCurrentAccess.map((doctorId) => ({
          doctorId,
          informationLastAccessDate: null,
        })),
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

export const getReportsDoctor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    if (!doctor) {
      throw new APIError({
        message: "Doctor does not exist",
        status: 404,
        errors: [
          {
            field: "Doctor",
            location: "token",
            messages: ["Doctor does not exist"],
          },
        ],
        stack: "",
      });
    }

    const patient = await Patient.get(req.params.patientId);

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "params",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    const patientReports = await Report.find({
      patient: patient._id,
    }).select("-reportUrl");

    const reports = patientReports.filter((report) => {
      return report.allowedDoctorsToView.find(
        (doc) => doc.doctorId.toString() === doctor._id.toString()
      );
    });

    res.json({
      reports,
    });
  } catch (error) {
    next(error);
  }
};

export const doctorViewReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    if (!doctor) {
      throw new APIError({
        message: "Doctor does not exist",
        status: 404,
        errors: [
          {
            field: "Doctor",
            location: "token",
            messages: ["Doctor does not exist"],
          },
        ],
        stack: "",
      });
    }

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      throw new APIError({
        message: "Report does not exist",
        status: 404,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["Report does not exist"],
          },
        ],
        stack: "",
      });
    }

    if (
      !report.allowedDoctorsToView.find(
        (doc) => doc.doctorId.toString() === doctor._id.toString()
      )
    ) {
      throw new APIError({
        message: "You are not authorized to view this report",
        status: 400,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["You are not authorized to view this report"],
          },
        ],
        stack: "",
      });
    }

    // Update the informationLastAccessDate for the doctor
    await Report.updateOne(
      {
        _id: report._id,
        "allowedDoctorsToView.doctorId": doctor._id,
      },
      {
        $set: {
          "allowedDoctorsToView.$.informationLastAccessDate": new Date(),
        },
      }
    );

    res.json({
      report,
    });
  } catch (error) {
    next(error);
  }
}

export const deleteReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    if (!patient) {
      throw new APIError({
        message: "Patient does not exist",
        status: 404,
        errors: [
          {
            field: "Patient",
            location: "token",
            messages: ["Patient does not exist"],
          },
        ],
        stack: "",
      });
    }

    const report = await Report.findById(req.params.reportId);

    if (!report) {
      throw new APIError({
        message: "Report does not exist",
        status: 404,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["Report does not exist"],
          },
        ],
        stack: "",
      });
    }

    if (report.patient.toString() !== patient._id.toString()) {
      throw new APIError({
        message: "You are not authorized to delete this report",
        status: 400,
        errors: [
          {
            field: "Report",
            location: "params",
            messages: ["You are not authorized to delete this report"],
          },
        ],
        stack: "",
      });
    }

    await Report.findByIdAndDelete(report._id);

    res.json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
