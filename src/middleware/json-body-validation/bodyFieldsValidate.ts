import { Response, NextFunction } from "express";
import { CustomRequest } from "types/customRequest";
import APIError from "../../errors/api-error";
import httpStatus from "http-status";

export const validateFields = (
  req: CustomRequest,
  _res: Response,
  next: NextFunction
) => {
  const allowedFields: string[] = req.allowedFields!; 
  const fieldsFromBody = Object.keys(req.body);

  const invalidFields = fieldsFromBody.filter(
    (field) => !allowedFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new APIError({
      message: `Invalid fields: ${invalidFields.join(", ")}`,
      errors: [],
      stack: "",
      status: httpStatus.BAD_REQUEST,
    });
  }

  next();
};
