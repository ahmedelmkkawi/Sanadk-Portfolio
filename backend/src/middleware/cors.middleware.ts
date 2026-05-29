import { Request, Response, NextFunction } from 'express';

function parseAllowedOrigins(): string[] {
  return (process.env.FRONTEND_URLS || 'http://localhost:4200,http://localhost:4201')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin: string): boolean {
  if (parseAllowedOrigins().includes(origin)) {
    return true;
  }
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }
  // Every Vercel production + preview URL
  if (origin.startsWith('https://') && origin.endsWith('.vercel.app')) {
    return true;
  }
  return false;
}

function applyCorsHeaders(req: Request, res: Response): void {
  const origin = req.headers.origin;
  if (typeof origin === 'string' && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
}

/** Handles CORS including all *.vercel.app preview deployment URLs. */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  applyCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    if (!req.headers.origin || !isOriginAllowed(req.headers.origin)) {
      res.status(403).json({
        statusCode: 403,
        message: `CORS blocked for origin: ${req.headers.origin ?? 'unknown'}`,
      });
      return;
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      (req.headers['access-control-request-headers'] as string) ||
        'Content-Type, Authorization',
    );
    res.status(204).end();
    return;
  }

  next();
}
