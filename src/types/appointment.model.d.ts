import { Document, Types } from 'mongoose';

interface IDoctorAvailability extends Document {
  date: Date;
  startTime: Date;
  doctorId: Types.ObjectId;
  sessionDuration: number;
  numberOfAppointments: number;
  location: string;
  status: string;
}

interface IAppointment extends Document {
  patient: Types.ObjectId;
  appointmentNumber: number;
  status: string;
  doctorAvailabilityId: Types.ObjectId;
}

export { IDoctorAvailability, IAppointment };