import dotenv from 'dotenv';

dotenv.config();

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { seedAdmin } from './services/auth.service';

async function bootstrap(): Promise<void> {
  await connectDatabase();
  await seedAdmin();

  const app = createApp();
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Sanadak Portfolio API running on: http://localhost:${port}/api`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
