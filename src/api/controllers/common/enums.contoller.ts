import {
  SriLankaUniversities,
  SriLankaHospitals,
  DoctorDesignation,
  Gender,
} from "../../../enums";
import { Request, Response, NextFunction } from "express";

// Get all the list of universities
export const getAllUniversityEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(SriLankaUniversities).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};

// Get all the list of hospitals
export const getAllHospitalEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(SriLankaHospitals).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};

// Get all the list of doctor designations
export const getAllDoctorDesignationEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(DoctorDesignation).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};

// Get all the list of genders
export const getAllGenderEnums = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const enumValues = Object.values(Gender).filter(
      (value) => typeof value === "string"
    );

    res.json(enumValues);
  } catch (error) {
    next(error);
  }
};
