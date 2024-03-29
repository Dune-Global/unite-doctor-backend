import mongoose, { Schema } from "mongoose";
import {
  PatientSession,
  Session,
  Medicine,
  Report,
  DoctorAccess,
} from "./../types";
import { medicalStatus } from "./../enums/medicalStages";

const medicineSchema = new Schema<Medicine>({
  name: String,
  dose: { type: String, default: null },
  time: { type: String, default: null },
});

const reportSchema = new Schema<Report>({
  name: String,
  dateToTake: { type: Date, default: null },
});

const sessionSchema = new Schema<Session>({
  sessionDate: { type: Date, default: Date.now },
  sessionDescription: String,
  symptoms: String,
  diseases: String,
  stage: { type: String, enum: Object.values(medicalStatus) },
  medicine: { type: [medicineSchema], default: [] },
  reports: { type: [reportSchema], default: [] },
  bloodPressure: { type: Number, default: null },
  weight: { type: Number, default: null },
  height: { type: Number, default: null },
  nextChanelDate: { type: Date, default: null },
  other: { type: String, default: null },
});

const doctorAccessSchema = new Schema<DoctorAccess>({
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
  informationLastAccessDate: { type: Date, default: null },
});

const patientSessionSchema = new Schema<PatientSession>({
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
  prescription: {
    type: [sessionSchema],
    default: [],
  },
  allowedDoctorsToViewThisDoctorsSessionDetails: {
    type: [doctorAccessSchema],
    default: [],
  },
  doctorLastAccessedDate: { type: Date, default: null },
  status: { type: String, enum: ['connected', 'disconnected'], default: 'connected' },
});

export default mongoose.model<PatientSession>(
  "PatientSession",
  patientSessionSchema
);

