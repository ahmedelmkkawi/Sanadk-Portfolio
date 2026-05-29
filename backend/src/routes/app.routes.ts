import { Router } from 'express';
import { jwtAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import * as statsService from '../services/stats.service';
import { isCloudinaryConfigured } from '../services/cloudinary.service';

const router = Router();

router.get('/', (_req, res) => {
  res.send('🚀 Sanadak Software Agency Portfolio API is running!');
});

router.get('/health', (_req, res) => {
  res.json({
    ok: true,
    cloudinaryConfigured: isCloudinaryConfigured(),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
  });
});

router.get(
  '/stats',
  jwtAuth,
  asyncHandler(async (_req, res) => {
    const stats = await statsService.getStats();
    res.json(stats);
  }),
);

export default router;
