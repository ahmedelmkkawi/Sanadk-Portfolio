import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import * as authService from '../services/auth.service';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  }),
);

export default router;
