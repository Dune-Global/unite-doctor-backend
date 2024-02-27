import express, { Request, Response } from "express";
import doctorRouter from "./doctor.route";
const router = express.Router();

router.get("/tryme", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

router.use("/doctor", doctorRouter);

export default router;
