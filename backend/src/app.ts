import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

function parseAllowedOrigins(): string[] {
  return (process.env.FRONTEND_URLS || 'http://localhost:4200,http://localhost:4201')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin: string): boolean {
  if (parseAllowedOrigins().includes(origin)) {
    return true;
  }
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }
  // All Vercel production + preview deployment URLs
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }
  return false;
}

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (isOriginAllowed(origin)) {
          callback(null, origin);
          return;
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => {
    res.json({
      message: 'Sanadak Portfolio API is running',
      apiBase: '/api',
      endpoints: {
        health: 'GET /api',
        login: 'POST /api/auth/login',
        projects: 'GET /api/projects',
        team: 'GET /api/team-members',
      },
    });
  });

  app.use('/api', routes);

  app.use((_req, res) => {
    res.status(404).json({
      statusCode: 404,
      message: `Cannot ${_req.method} ${_req.path}`,
      hint: 'All API routes start with /api (example: GET /api/projects)',
    });
  });

  app.use(errorHandler);

  return app;
}
