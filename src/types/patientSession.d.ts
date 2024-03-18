import { Document } from 'mongoose';

export interface Medicine {
  name: string;
  dose?: string;
  time?: string;
}

export interface Report {
  name: string;
  dateToTake?: Date;
}

export interface Session {
  sessionDate: Date;
  symptoms: string;
  diseases: string;
  stage: string;
  medicine: Medicine[];
  reports: Report[];
  weight?: number;
  height?: number;
  nextChanelDate?: Date;
  other?: string;
}

export interface DoctorAccess {
  doctorId: mongoose.Schema.Types.ObjectId;
  informationLastAccessDate?: Date;
}

export interface ReportAccess {
  reportId: mongoose.Schema.Types.ObjectId;
  lastAccessDateByDoctor?: Date;
}

export interface PatientSession extends Document {
  patient: mongoose.Schema.Types.ObjectId;
  doctor: mongoose.Schema.Types.ObjectId;
  prescription: Session[];
  allowedDoctorsToViewThisDoctorsSessionDetails: DoctorAccess[];
  allowedReportsToViewByThisDoctor: ReportAccess[];
}