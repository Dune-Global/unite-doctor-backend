import mongoose from "mongoose";

export interface ITransformedDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  slmcNumber: string;
  mobile: number;
  designation: string;
  dateOfBirth: string;
  gender: string;
  imgUrl: string;
  nicNumber: string;
  clinic: {
    isClinic?: boolean;
    clinicName?: string;
    clinicAddress?: string;
  };
  currentUniversity?: string;
  currentHospital?: string;
  isEmailVerified: boolean;
  isSlmcVerified: boolean;

  transform(): Partial<ITransformedDoctor>;
}

export interface IDoctor {
  firstName: string;
  lastName: string;
  email: string;
  slmcNumber: string;
  mobile: number;
  designation: string;
  dateOfBirth: string;
  gender: string;
  nicNumber: string;
  imgUrl: string;
  clinic: {
    isClinic: boolean;
    clinicName?: string;
    clinicAddress?: string;
  };
  currentUniversity: string;
  currentHospital: string;
  isEmailVerified: boolean;
  isSlmcVerified: boolean;
  password: string;
}

export interface IDoctorUpdatableFields {
  firstName?: string;
  lastName?: string;
  email?: string;
  slmcNumber?: string;
  mobile?: number;
  designation?: string;
  dateOfBirth?: string;
  gender?: string;
  nicNumber?: string;
  imgUrl?: string;
  clinic?: {
    isClinic: boolean;
    clinicName?: string;
    clinicAddress?: string;
  };
  currentUniversity?: string;
  currentHospital?: string;
}

export interface IDoctorMethods {
  passwordMatches(password: string, pwhash: string): any;
  transform(this: mongoose.Document): Partial<ITransformedDoctor>;
}

export interface IList {
  page?: number;
  perPage?: number;
  name?: string;
  email?: string;
}

export interface IDoctorModel
  extends mongoose.Model<IDoctor, {}, IDoctorMethods> {
  list: (options: IList) => Promise<ITransformedDoctor[]>;
  checkDuplicateFields: (error: any) => APIError;
  get: (id: string) => Promise<IDoctor, APIError>;
  findAndGenerateToken: (
    options: IDoctorLoginRequest
  ) => Promise<IDoctorSuccessLogin>;
}

export interface IDoctorLoginRequest {
  email: string;
  password: string;
}

export interface IDoctorSuccessLogin {
  accessToken: string;
  refreshToken: string;
}

export interface IDoctorUpdateSuccess {
  message: string;
  updatedFieldNames: string[];
}
