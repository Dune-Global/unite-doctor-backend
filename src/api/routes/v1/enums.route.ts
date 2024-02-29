import {
  getAllUniversityEnums,
  getAllHospitalEnums,
  getAllDoctorDesignationEnums,
  getAllGenderEnums,
} from "../../../api/controllers/enums.contoller";
import express from "express";

const router = express.Router();

// Get enums as list
router.get("/university-list", getAllUniversityEnums);
router.get("/hospital-list", getAllHospitalEnums);
router.get("/doctor-designation-list", getAllDoctorDesignationEnums);
router.get("/gender-list", getAllGenderEnums);

export default router;
