import { Request, Response, NextFunction } from "express";

export const localVariables = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.app.locals = {
    id: "",
    isAuthDoctor: false,
    resetSession: false,
  };
  next();
};
