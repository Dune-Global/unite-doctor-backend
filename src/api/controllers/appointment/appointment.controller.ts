import { Request, Response, NextFunction } from "express";
import Doctor from "../../../models/doctor.model";
import Patient from "../../../models/patient.model";
import {
  Appointment,
  DoctorAvailability,
} from "../../../models/appointment.model";
import {
  decodedDoctorPayload,
  decodedPatientPayload,
} from "../../../utils/jwt-auth/jwtDecoder";
import { AppointmentStatus } from "./../../../enums/appointmentStatus";
import APIError from "./../../../errors/api-error";
import { doctorAppointmentCancellationMail } from "./../../../utils/sendMail";

export const createNewAppointmentDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    const availabilityDetails = req.body;

    const newAvailability = new DoctorAvailability({
      date: new Date(availabilityDetails.date),
      startTime: new Date(availabilityDetails.startTime),
      doctorId: doctor,
      sessionDuration: availabilityDetails.sessionDuration,
      numberOfAppointments: availabilityDetails.numberOfAppointments,
      location: availabilityDetails.location,
    });
    await newAvailability.save();

    res.status(200).json({
      message: "New availability created successfully",
      scheduleId: newAvailability._id,
      doctorId: doctor._id,
      date: newAvailability.date,
      sessionDuration: newAvailability.sessionDuration,
      numberOfAppointments: newAvailability.numberOfAppointments,
      location: newAvailability.location,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorsAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorId = req.params.doctorId;
    const doctorData = await Doctor.get(doctorId);

    const availabilities = await DoctorAvailability.find({
      doctorId: doctorData,
      status: AppointmentStatus.PENDING,
    })
      .select("-startTime -__v")
      .sort({ date: 1, startTime: 1 }) // Sort by date and startTime in ascending order
      .exec();

    const doctor = {
      _id: doctorData._id,
      firstName: doctorData.firstName,
      lastName: doctorData.lastName,
      designation: doctorData.designation,
      gender: doctorData.gender,
      email: doctorData.email,
      imgUrl: doctorData.imgUrl,
    };
    res.status(200).json({
      doctor,
      availabilities,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    const availabilityId = req.params.availabilityId;

    // Only allow updates to sessionDuration, numberOfAppointments, location, and status
    const availabilityDetails = {
      sessionDuration: req.body.sessionDuration,
      numberOfAppointments: req.body.numberOfAppointments,
      location: req.body.location,
    };

    const availability = await DoctorAvailability.findById(availabilityId);

    if (!availability) {
      throw new APIError({
        message: `No schedule found with the id ${availabilityId}`,
        status: 404,
        errors: [
          {
            field: "Appointment",
            location: "params",
            messages: [`No schedule found with the id ${availabilityId}`],
          },
        ],
        stack: "",
      });
    }

    // Check if the doctor is the owner of the availability
    if (availability.doctorId.toString() !== doctor._id.toString()) {
      throw new APIError({
        message: `You can't update this doctor schedule`,
        status: 403,
        errors: [
          {
            field: "Appointment",
            location: "authorization",
            messages: [`You can't update this doctor schedule`],
          },
        ],
        stack: "",
      });
    }

    const updatedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availabilityId,
      availabilityDetails,
      { new: true }
    );

    res.status(200).json({
      message: "Availability updated successfully",
      updatedAvailability,
    });
  } catch (error) {
    next(error);
  }
};

export const updatedAvailabilityStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    const availabilityId = req.params.availabilityId;

    const availability = await DoctorAvailability.findById(availabilityId);

    if (!availability) {
      throw new APIError({
        message: `No schedule found with the id ${availabilityId}`,
        status: 404,
        errors: [
          {
            field: "Appointment",
            location: "params",
            messages: [`No schedule found with the id ${availabilityId}`],
          },
        ],
        stack: "",
      });
    }

    // Check if the doctor is the owner of the availability
    if (availability.doctorId.toString() !== doctor._id.toString()) {
      throw new APIError({
        message: `You can't update this doctor schedule`,
        status: 403,
        errors: [
          {
            field: "Appointment",
            location: "authorization",
            messages: [`You can't update this doctor schedule`],
          },
        ],
        stack: "",
      });
    }

    const updatedAvailability = await DoctorAvailability.findByIdAndUpdate(
      availabilityId,
      { status: req.body.status },
      { new: true }
    );

    if (req.body.status === AppointmentStatus.CANCELLED) {
      const appointments = await Appointment.find({
        doctorAvailabilityId: availabilityId,
      });

      const patientIds = appointments.map((appointment) => appointment.patient);
      const patients = await Patient.find({ _id: { $in: patientIds } });

      for (const appointment of appointments) {
        const patient = patients.find(
          (p) => p._id.toString() === appointment.patient.toString()
        );

        if (patient) {
          const date = new Date(availability.date);
          const formattedDate = `${date.getFullYear()} ${date.toLocaleString(
            "default",
            { month: "long" }
          )} ${date.getDate()} at ${date.getHours()}:${
            date.getMinutes() < 10 ? "0" : ""
          }${date.getMinutes()}`;

          const mailSendDetails = await doctorAppointmentCancellationMail(
            patient.email,
            "Important: Your Appointment Has Been Cancelled",
            patient.firstName,
            patient.lastName,
            `${doctor.firstName} ${doctor.lastName}`,
            availability.location,
            formattedDate
          );
          console.log(mailSendDetails);

          // Update the appointment status
          appointment.status = AppointmentStatus.CANCELLED_BY_DOCTOR;
          await appointment.save();
        } else {
          console.error(`No patient found with id: ${appointment.patient}`);
        }
      }
    }

    if (req.body.status === AppointmentStatus.DONE) {
      await Appointment.updateMany(
        { doctorAvailabilityId: availabilityId },
        { status: AppointmentStatus.CANCELLED }
      );
    }

    res.status(200).json({
      message: "Availability status updated successfully",
      updatedAvailability,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableAppointmentNumbers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctorAvailabilityId = req.params.availabilityId;
    const doctorAvailability = await DoctorAvailability.findById(
      doctorAvailabilityId
    );
    if (!doctorAvailability) {
      throw new APIError({
        message: `Doctor schedule not found with id: ${doctorAvailabilityId}`,
        status: 403,
        errors: [
          {
            field: "doctorSchedule",
            location: "params",
            messages: [
              `Doctor schedule not found with id: ${doctorAvailabilityId}`,
            ],
          },
        ],
        stack: "",
      });
    }

    if (
      doctorAvailability.status === AppointmentStatus.CANCELLED ||
      doctorAvailability.status === AppointmentStatus.DONE
    ) {
      throw new APIError({
        message: `Doctor schedule is not available`,
        status: 403,
        errors: [
          {
            field: "doctorSchedule",
            location: "params",
            messages: [`Doctor schedule is not available`],
          },
        ],
        stack: "",
      });
    }

    // Exclude cancelled appointments from the takenAppointmentNumbers array
    const appointments = await Appointment.find({
      doctorAvailabilityId,
      status: { $ne: AppointmentStatus.CANCELLED },
    });

    const takenAppointmentNumbers = appointments.map(
      (appointment) => appointment.appointmentNumber
    );

    const maxAppointments = doctorAvailability.numberOfAppointments;

    // Create an array of all possible appointment numbers
    const allAppointmentNumbers = Array.from(
      { length: maxAppointments },
      (_, i) => i + 1
    );

    // Filter out the taken appointment numbers to get the available ones
    const availableAppointmentNumbers = allAppointmentNumbers.filter(
      (number) => !takenAppointmentNumbers.includes(number)
    );

    // Map the available appointment numbers to objects with the appointment number and its allocated time
    const availableAppointmentsWithTimes = availableAppointmentNumbers.map(
      (number) => {
        const allocatedTime = new Date(
          doctorAvailability.startTime.getTime() +
            number * doctorAvailability.sessionDuration * 60000
        );
        return { appointmentNumber: number, allocatedTime };
      }
    );

    // Send the available appointments with their times back to the client
    res.json(availableAppointmentsWithTimes);
  } catch (error) {
    next(error);
  }
};

export const getAnAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const availabilityId = req.params.availabilityId;
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);
    const appointmentNumber = req.body.appointmentNumber;

    const appointment = new Appointment({
      patient: patient._id,
      appointmentNumber,
      doctorAvailabilityId: availabilityId,
      status: AppointmentStatus.PENDING,
    });

    await appointment.save();

    // Fetch the DoctorAvailability document from the database
    const doctorAvailability = await DoctorAvailability.findById(
      availabilityId
    );

    // Check if doctorAvailability is null
    if (
      !doctorAvailability ||
      doctorAvailability.status === AppointmentStatus.CANCELLED ||
      doctorAvailability.status === AppointmentStatus.DONE
    ) {
      throw new APIError({
        message: `Doctor schedule not found with id: ${doctorAvailability}`,
        status: 403,
        errors: [
          {
            field: "doctorSchedule",
            location: "params",
            messages: [
              `Doctor schedule not found with id: ${doctorAvailability}`,
            ],
          },
        ],
        stack: "",
      });
    }

    const appointmentTime = new Date(
      doctorAvailability.startTime.getTime() +
        appointment.appointmentNumber *
          doctorAvailability.sessionDuration *
          60000
    );

    res.json({
      appointmentId: appointment._id,
      scheduleId: doctorAvailability._id,
      patient: appointment.patient._id,
      appointmentNumber: appointment.appointmentNumber,
      appointmentTime: appointmentTime.toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAnAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointmentId = req.params.appointmentId;
    const appointment = await Appointment.findById(appointmentId);

    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patient = await Patient.get(decodedToken.id);

    if (!appointment) {
      throw new APIError({
        message: `No appointment found with id: ${appointmentId}`,
        status: 404,
        errors: [
          {
            field: "appointment",
            location: "params",
            messages: [`No appointment found with id: ${appointmentId}`],
          },
        ],
        stack: "",
      });
    }

    // Check if the appointment belongs to the patient
    if (appointment.patient.toString() !== patient._id.toString()) {
      throw new APIError({
        message: `Appointment does not belong to the patient`,
        status: 403,
        errors: [
          {
            field: "appointment",
            location: "params",
            messages: [`Appointment does not belong to the patient`],
          },
        ],
        stack: "",
      });
    }

    // Update the appointment status to "CANCELLED"
    appointment.status = AppointmentStatus.CANCELLED;

    // Save the updated appointment to the database
    await appointment.save();

    // Send the updated appointment back to the client
    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctorId = decodedToken.id;

    // Fetch all availabilities of the doctor sorted by date
    const availabilities = await DoctorAvailability.find({
      doctorId: doctorId,
      status: AppointmentStatus.PENDING,
    }).sort({ date: 1 });

    const appointmentsArray = [];

    // For each availability, fetch the appointments sorted by appointment number
    for (const availability of availabilities) {
      const appointments: any = await Appointment.find({
        doctorAvailabilityId: availability._id,
        status: AppointmentStatus.PENDING,
      })
        .populate(
          "patient",
          "-password -email -createdAt -updatedAt -mobile -__v"
        ) // Only select these fields
        .sort({ appointmentNumber: 1 });

      // For each appointment, calculate the session time
      for (const appointment of appointments) {
        const startTime = availability.startTime.getTime(); // Convert to timestamp
        const totalDuration =
          availability.sessionDuration * (appointment.appointmentNumber - 1); // Subtract 1 because appointmentNumber starts from 1
        const sessionTime = new Date(startTime + totalDuration * 60000); // Convert back to date object, multiply by 60000 to convert minutes to milliseconds

        // Convert the appointment to a plain JavaScript object and add the session time
        const appointmentObj = appointment.toObject();
        appointmentObj.sessionTime = sessionTime;
        appointmentObj.location = availability.location;

        // Replace the appointment in the array with the new object
        appointments[appointments.indexOf(appointment)] = appointmentObj;
      }

      // Push the availability date, location, and appointments into the array
      appointmentsArray.push({
        date: availability.date,
        location: availability.location,
        appointments: appointments,
      });
    }

    res.json(appointmentsArray);
  } catch (error) {
    next(error);
  }
};

export const getPatientAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patientId = req.params.patientId; // Assuming patientId is passed as a URL parameter

    // Fetch all availabilities of the doctor sorted by date
    const availabilities = await DoctorAvailability.find({
      patient: patientId,
      status: AppointmentStatus.PENDING,
    }).sort({ date: 1 });

    const appointmentsArray = [];

    // For each availability, fetch the appointments sorted by appointment number
    for (const availability of availabilities) {
      const appointments: any = await Appointment.find({
        doctorAvailabilityId: availability._id,
        status: AppointmentStatus.PENDING,
      })
        .populate({
          path: "doctorAvailabilityId",
          populate: {
            path: "doctorId",
            model: "Doctor",
            select:
              "-password -clinic -mobile -dateOfBirth -nicNumber -isEmailVerified -isSlmcVerified -createdAt -updatedAt", // Exclude password field
          },
        }) // Populate doctor details
        .sort({ appointmentNumber: 1 });

      // For each appointment, calculate the session time
      for (const appointment of appointments) {
        const startTime = availability.startTime.getTime(); // Convert to timestamp
        const totalDuration =
          availability.sessionDuration * (appointment.appointmentNumber - 1); // Subtract 1 because appointmentNumber starts from 1
        const sessionTime = new Date(startTime + totalDuration * 60000); // Convert back to date object, multiply by 60000 to convert minutes to milliseconds

        // Convert the appointment to a plain JavaScript object and add the session time
        const appointmentObj = appointment.toObject();
        appointmentObj.sessionTime = sessionTime;
        appointmentObj.location = availability.location;

        // Replace the appointment in the array with the new object
        appointments[appointments.indexOf(appointment)] = appointmentObj;
      }

      // Push the availability date, location, and appointments into the array
      appointmentsArray.push({
        date: availability.date,
        location: availability.location,
        appointments: appointments,
      });
    }

    res.json(appointmentsArray);
  } catch (error) {
    next(error);
  }
};

export const doctorAppointmentStatusUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctor = await Doctor.get(decodedToken.id);

    const appointmentId = req.params.appointmentId;
    const status = req.body.status;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new APIError({
        message: `No appointment found with id: ${appointmentId}`,
        status: 404,
        errors: [
          {
            field: "appointment",
            location: "params",
            messages: [`No appointment found with id: ${appointmentId}`],
          },
        ],
        stack: "",
      });
    }

    const availability = await DoctorAvailability.findById(
      appointment.doctorAvailabilityId
    );

    if (!availability) {
      throw new APIError({
        message: `No availability found with id: ${appointment.doctorAvailabilityId}`,
        status: 404,
        errors: [
          {
            field: "availability",
            location: "params",
            messages: [
              `No availability found with id: ${appointment.doctorAvailabilityId}`,
            ],
          },
        ],
        stack: "",
      });
    }

    if (availability.doctorId.toString() !== doctor._id.toString()) {
      throw new APIError({
        message: `You can't update this appointment`,
        status: 403,
        errors: [
          {
            field: "appointment",
            location: "authorization",
            messages: [`You can't update this appointment`],
          },
        ],
        stack: "",
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment).status(200);
  } catch (error) {
    next(error);
  }
};

export const getPatientTotalAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedPatientPayload(token as string);
    const patientId = decodedToken.id;

    const appointments = await Appointment.find({
      patient: patientId,
    }).populate("doctorAvailabilityId");

    let appointmentDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const doctorAvailability: any = appointment.doctorAvailabilityId;

        // Check if doctorAvailability is not null
        if (!doctorAvailability) {
          return null;
        }

        const sessionTime = new Date(
          doctorAvailability.startTime.getTime() +
            appointment.appointmentNumber *
              doctorAvailability.sessionDuration *
              60000
        );

        const doctor: any = await Doctor.findById(doctorAvailability.doctorId);
        return {
          appointmentNumber: appointment.appointmentNumber,
          sessionTime,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          imgUrl: doctor.imgUrl,
          designation: doctor.designation,
          email: doctor.email,
          gender: doctor.gender,
        };
      })
    );

    // Filter out null values
    let nonNullAppointmentDetails = appointmentDetails.filter(
      (appointment): appointment is NonNullable<typeof appointment> =>
        appointment !== null
    );

    if (req.query.today === "true") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      nonNullAppointmentDetails = nonNullAppointmentDetails.filter(
        (appointment) =>
          appointment.sessionTime >= today && appointment.sessionTime < tomorrow
      );
    }

    nonNullAppointmentDetails.sort(
      (a, b) => a.sessionTime.getTime() - b.sessionTime.getTime()
    );

    res.status(200).json(nonNullAppointmentDetails);
  } catch (error) {
    next(error);
  }
};

export const getAnAppointmentsByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decodedToken = decodedDoctorPayload(token as string);
    const doctorId = decodedToken.id;

    const yearNumber = parseInt(req.params.year, 10);
    const monthNumber = parseInt(req.params.month, 10);
    const dayNumber = parseInt(req.params.day, 10);

    // Create a date object for the start of the day
    const startDate = new Date(yearNumber, monthNumber - 1, dayNumber);
    // Create a date object for the end of the day
    const endDate = new Date(
      yearNumber,
      monthNumber - 1,
      dayNumber,
      23,
      59,
      59
    );

    // Query the database for doctor's availabilities that match the date and doctor's ID
    const doctorAvailabilities = await DoctorAvailability.find({
      doctorId: doctorId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // For each doctor's availability, find the appointments
    const appointments = [];
    for (const availability of doctorAvailabilities) {
      const availabilityAppointments = await Appointment.find({
        doctorAvailabilityId: availability._id,
      })
      .populate("doctorAvailabilityId")
      .populate("patient");

      const appointmentDetails = await Promise.all(
        availabilityAppointments.map(async (appointment) => {
          const doctorAvailability: any = appointment.doctorAvailabilityId;
          const patient: any = appointment.patient;

          // Check if doctorAvailability and patient are not null
          if (!doctorAvailability || !patient) {
            return null;
          }

          // Calculate the appointment time
          const appointmentTime = new Date(
            doctorAvailability.startTime.getTime() +
              (appointment.appointmentNumber - 1) *
                doctorAvailability.sessionDuration *
                60000
          );

          return {
            appointmentNumber: appointment.appointmentNumber,
            appointmentTime,
            firstName: patient.firstName,
            lastName: patient.lastName,
            imgUrl: patient.imgUrl,
          };
        })
      );

      appointments.push(...appointmentDetails);
    }

    // Filter out null values
    let nonNullAppointmentDetails = appointments.filter(
      (appointment): appointment is NonNullable<typeof appointment> =>
        appointment !== null
    );

    // Send the appointments to the client
    res.json(nonNullAppointmentDetails);
  } catch (error) {
    next(error);
  }
};