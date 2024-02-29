import express from "express";
import { refresh } from "../../../controllers/common/refreshToken.controller";

const router = express.Router();

// Route for get the Refresh token
router.get("/refresh", refresh);

export default router;