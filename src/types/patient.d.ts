import mongoose from "mongoose";

export interface ITransformedPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  imgUrl: string;
  isEmailVerified: boolean;
  mobile?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  allergies?: string;
  hereditaryDiseases?: string;
  transform(): Partial<ITransformedPatient>;
}

export interface IPatient {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: string;
  imgUrl: string;
  isEmailVerified: boolean;
  password: string;
  mobile?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  allergies?: string;
  hereditaryDiseases?: string;
}

export interface IPatientUpdatableFields {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  imgUrl?: string;
  mobile?: string;
  height?: string;
  weight?: string;
  bloodGroup?: string;
  allergies?: string;
  hereditaryDiseases?: string;
}

export interface IPatientMethods {
  passwordMatches(password: string, pwhash: string): any;
  transform(this: mongoose.Document): Partial<ITransformedPatient>;
}

export interface IList {
  page?: number;
  perPage?: number;
  name?: string;
  email?: string;
}

export interface IPatientModel
  extends mongoose.Model<IPatient, {}, IPatientMethods> {
  list: (options: IList) => Promise<ITransformedPatient[]>;
  checkDuplicateFields: (error: any) => APIError;
  get: (id: string) => Promise<IPatient, APIError>;
  findAndGenerateToken: (
    options: IPatientLoginRequest
  ) => Promise<IPatientSuccessLogin>;
}

export interface IPatientLoginRequest {
  email: string;
  password: string;
}

export interface IPatientSuccessLogin {
  accessToken: string;
  refreshToken: string;
}

export interface IPatientUpdateSuccess {
  message: string;
  updatedFieldNames: string[];
}
