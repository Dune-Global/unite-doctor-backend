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
  sessionDescription: string;
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

export interface PatientSession extends Document {
  patient: mongoose.Schema.Types.ObjectId;
  doctor: mongoose.Schema.Types.ObjectId;
  prescription: Session[];
  allowedDoctorsToViewThisDoctorsSessionDetails: DoctorAccess[];
  doctorLastAccessedDate ?: Date;
  status: 'connected' | 'disconnected';
}