import mongoose from "mongoose";

export interface ITransformedDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  slmcNumber: string;
  mobile: number;
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
  password: string;
  isEmailVerified: boolean;
  isSlmcVerified: boolean;
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
}
