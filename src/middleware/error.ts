import httpStatus from "http-status";
import APIError from "../errors/api-error";
import config from "../config/env";
import { NextFunction, Request, Response } from "express";

/*
 * Error handler. Send stacktrace only during development
 * @public
 */

export const handler = (
  err: APIError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const response = {
    message: err.message || (httpStatus as any)[err.status],
    errors: err.errors,
    stack: err.stack,
  };

  if (config.isDev) {
    delete response.stack;
  }

  res.status(err.status || 400);
  res.json(response);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new APIError({
    message: "Not Found",
    status: httpStatus.NOT_FOUND,
    errors: [],
    stack: "",
  });
  return handler(err, req, res, next);
};
