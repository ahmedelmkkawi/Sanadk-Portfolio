import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';

const expressApp = express();
let initialized = false;

async function bootstrap(): Promise<void> {
  if (initialized) {
    return;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  configureApp(app);
  await app.init();
  initialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await bootstrap();
  return expressApp(req, res);
}
