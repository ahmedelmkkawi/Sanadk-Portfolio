import mongoose from 'mongoose';

const mongoUri =
  process.env.MONGODB_URI?.trim() || 'mongodb://localhost:27017/sanadak-portfolio';

const serverless =
  process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(mongoUri, {
    bufferCommands: false,
    maxPoolSize: serverless ? 1 : 10,
    minPoolSize: serverless ? 0 : 0,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });
}
