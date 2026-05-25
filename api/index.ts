import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

const expressApp = express();
let bootstrapPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it in Vercel ? Project ? Settings ? Environment Variables.',
    );
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  });
  configureApp(app);
  await app.init();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!bootstrapPromise) {
      bootstrapPromise = bootstrap();
    }
    await bootstrapPromise;
    return expressApp(req, res);
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
