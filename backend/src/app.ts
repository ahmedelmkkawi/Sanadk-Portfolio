import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp(): express.Application {
  const app = express();

  const allowedOrigins = (
    process.env.FRONTEND_URLS || 'http://localhost:4200,http://localhost:4201'
  ).split(',');

  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests from configured origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      }
      // Allow vercel.app subdomains
      else if (origin.includes('.vercel.app')) {
        callback(null, true);
      }
      // Allow localhost in development
      else if (origin.includes('localhost')) {
        callback(null, true);
      }
      else {
        callback(null, false);
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

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
