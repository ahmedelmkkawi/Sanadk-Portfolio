import dotenv from 'dotenv';

dotenv.config();

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/config/database';
import { seedAdmin } from '../src/services/auth.service';

let readyPromise: Promise<ReturnType<typeof createApp>> | null = null;

async function bootstrap(): Promise<ReturnType<typeof createApp>> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it in Vercel → Project → Settings → Environment Variables.',
    );
  }

  await connectDatabase();
  await seedAdmin();
  return createApp();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!readyPromise) {
      readyPromise = bootstrap();
    }
    const app = await readyPromise;
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      detail,
    });
  }
}
