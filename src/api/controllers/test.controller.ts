import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

// test route
export const test = (_req: Request, res: Response) => {
	res.json({
		message: "Hello from testing route ✅",
	});
};
