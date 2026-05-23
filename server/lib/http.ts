import type { Request, Response, NextFunction, RequestHandler } from 'express';

export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function createHttpError(statusCode: number, message: string, details?: unknown): HttpError {
  return new HttpError(statusCode, message, details);
}

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  const details = err instanceof HttpError ? err.details : undefined;
  res.status(statusCode).json({ error: message, details });
}
