import express from "express";
import { refresh } from "../../controllers/refreshToken.controller";

const router = express.Router();

// Route for get the Refresh token
router.get("/refresh", refresh);

export default router;