import express, { Request, Response } from "express";
import doctorRouter from "./doctor.route";
import refreshRouter from "./refreshToken.route";
import enumsRouter from "./enums.route";
const router = express.Router();

// Test route for check overall connectivity
router.get("/tryme", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

// Plug the router into the express app
router.use("/doctor", doctorRouter);
router.use("/token", refreshRouter);

// common routes
router.use("/common", enumsRouter);

export default router;
