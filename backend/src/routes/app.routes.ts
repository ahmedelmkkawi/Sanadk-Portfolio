import { Router } from 'express';
import { jwtAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import * as statsService from '../services/stats.service';

const router = Router();

router.get('/', (_req, res) => {
  res.send('🚀 Sanadak Software Agency Portfolio API is running!');
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
