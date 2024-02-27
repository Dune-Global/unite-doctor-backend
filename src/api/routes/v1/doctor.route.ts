import  express  from "express";
import { createDoctor, getDoctors } from "../../controllers/doctor.controller";

const router = express.Router();

router.get("/all", getDoctors);
router.post("/create", createDoctor);

export default router;