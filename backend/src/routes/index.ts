import { Router } from 'express';
import appRoutes from './app.routes';
import authRoutes from './auth.routes';
import projectsRoutes from './projects.routes';
import teamMembersRoutes from './team-members.routes';

const router = Router();

router.use('/', appRoutes);
router.use('/auth', authRoutes);
router.use('/projects', projectsRoutes);
router.use('/team-members', teamMembersRoutes);

export default router;
