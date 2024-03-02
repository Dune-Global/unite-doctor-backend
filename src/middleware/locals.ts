import { Request, Response, NextFunction } from "express";

export const localVariables = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  req.app.locals = {
    id: "",
    isAuth: false,
    resetSession: false,
  };
  next();
};
