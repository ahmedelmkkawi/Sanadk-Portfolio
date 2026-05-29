import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

export function createApp(): express.Application {
  const app = express();

  const allowedOrigins = (
    process.env.FRONTEND_URLS || 'http://localhost:4200,http://localhost:4201'
  ).split(',');

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (_req, res) => {
    res.redirect(302, '/api');
  });

  app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
