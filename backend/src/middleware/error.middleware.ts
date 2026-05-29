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

  if (err instanceof Error && err.message.startsWith('CORS blocked')) {
    res.status(403).json({
      statusCode: 403,
      message: err.message,
      hint: 'Add this site URL to FRONTEND_URLS on Railway, or redeploy the latest backend.',
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
