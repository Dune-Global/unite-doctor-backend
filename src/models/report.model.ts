import mongoose, { Document, Schema } from 'mongoose';
import { DoctorAccess } from './../types';

interface IDoctorAccess extends Document {
  doctorId: mongoose.Schema.Types.ObjectId;
  informationLastAccessDate: Date | null;
}

interface IReport extends Document {
  reportType: string;
  tookDate: Date;
  patient: mongoose.Schema.Types.ObjectId;
  reportUrl: string;
  allowedDoctorsToView: IDoctorAccess[];
}

const doctorAccessSchema = new Schema<DoctorAccess>({
  doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
  informationLastAccessDate: { type: Date, default: null },
});

const ReportSchema: Schema<IReport> = new Schema({
  reportType: { type: String, required: true },
  tookDate: { type: Date, required: true },
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  reportUrl: { type: String, required: true },
  allowedDoctorsToView: {
    type: [doctorAccessSchema],
    default: [],
  },
});

export default mongoose.model<IReport>('Report', ReportSchema);