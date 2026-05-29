import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { seedAdmin } from './services/auth.service';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await seedAdmin();

  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  app.listen(port, host, () => {
    console.log(`Sanadak Portfolio API running on port ${port} (/api)`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
