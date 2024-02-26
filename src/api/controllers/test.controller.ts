import { Request, Response } from "express";

// test route
export const test = (_req: Request, res: Response) => {
	res.json({
		message: "Hello from testing route ✅",
	});
};
