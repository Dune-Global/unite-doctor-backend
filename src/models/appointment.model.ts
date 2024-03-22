import mongoose, { Schema } from "mongoose";
import { IDoctorAvailability, IAppointment } from "../types";
import { AppointmentStatus } from "./../enums";

const doctorAvailabilitySchema = new Schema<IDoctorAvailability>({
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value: Date) {
        // Check if the date is in the future
        return value.getTime() > Date.now();
      },
      message: "Date must be in the future",
    },
  },
  startTime: { type: Date, required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
  sessionDuration: { type: Number, required: true },
  numberOfAppointments: { type: Number, required: true },
  location: { type: String, required: true },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDING,
    required: true,
  },
});

const appointmentSchema = new Schema<IAppointment>({
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  appointmentNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: Object.values(AppointmentStatus),
    default: AppointmentStatus.PENDING,
    required: true,
  },
  doctorAvailabilityId: {
    type: Schema.Types.ObjectId,
    ref: "DoctorAvailability",
    required: true,
  },
});

const DoctorAvailability = mongoose.model(
  "DoctorAvailability",
  doctorAvailabilitySchema
);
const Appointment = mongoose.model("Appointment", appointmentSchema);

export { DoctorAvailability, Appointment };
