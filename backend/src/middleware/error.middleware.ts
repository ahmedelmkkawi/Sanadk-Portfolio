import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/http-error';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
    });
    return;
  }

  console.error('Unhandled error:', err);
  const detail = err instanceof Error ? err.message : String(err);
  res.status(500).json({
    statusCode: 500,
    message: 'Internal server error',
    detail,
  });
}
