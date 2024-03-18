import mongoose, { Schema } from "mongoose";
import {
  PatientSession,
  Session,
  Medicine,
  Report,
  DoctorAccess,
  ReportAccess,
} from "./../types";

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
  sessionDate: Date,
  symptoms: String,
  diseases: String,
  stage: String,
  medicine: { type: [medicineSchema], default: [] },
  reports: { type: [reportSchema], default: [] },
  weight: { type: Number, default: null },
  height: { type: Number, default: null },
  nextChanelDate: { type: Date, default: null },
  other: { type: String, default: null },
});

const doctorAccessSchema = new Schema<DoctorAccess>({
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
  informationLastAccessDate: { type: Date, default: null },
});

const reportAccessSchema = new Schema<ReportAccess>({
  reportId: { type: Schema.Types.ObjectId, ref: "Report" },
  lastAccessDateByDoctor: { type: Date, default: null },
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
  allowedReportsToViewByThisDoctor: { type: [reportAccessSchema], default: [] },
  doctorLastAccessedDate: { type: Date, default: null },
});

export default mongoose.model<PatientSession>(
  "PatientSession",
  patientSessionSchema
);
