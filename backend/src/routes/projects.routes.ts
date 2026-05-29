import { Router } from 'express';
import multer from 'multer';
import { jwtAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import { parseArrayField, parseBooleanField } from '../utils/form-fields';
import * as projectsService from '../services/projects.service';
import { uploadImage } from '../services/cloudinary.service';
import {
  CreateProjectInput,
  UpdateProjectInput,
} from '../services/projects.service';
import { routeParam } from '../utils/params';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseProjectBody(body: Record<string, unknown>): CreateProjectInput {
  return {
    title: String(body.title || ''),
    description: String(body.description || ''),
    images: parseArrayField(body.images),
    technologies: parseArrayField(body.technologies),
    category: String(body.category || ''),
    status: body.status ? String(body.status) : undefined,
    liveUrl: body.liveUrl ? String(body.liveUrl) : undefined,
    githubUrl: body.githubUrl ? String(body.githubUrl) : undefined,
    featured: parseBooleanField(body.featured),
    teamMembers: parseArrayField(body.teamMembers),
  };
}

function parseUpdateProjectBody(body: Record<string, unknown>): UpdateProjectInput {
  const input: UpdateProjectInput = {};
  if (body.title !== undefined) input.title = String(body.title);
  if (body.description !== undefined) input.description = String(body.description);
  if (body.images !== undefined) input.images = parseArrayField(body.images);
  if (body.technologies !== undefined) {
    input.technologies = parseArrayField(body.technologies);
  }
  if (body.category !== undefined) input.category = String(body.category);
  if (body.status !== undefined) input.status = String(body.status);
  if (body.liveUrl !== undefined) input.liveUrl = String(body.liveUrl);
  if (body.githubUrl !== undefined) input.githubUrl = String(body.githubUrl);
  if (body.featured !== undefined) input.featured = parseBooleanField(body.featured);
  if (body.teamMembers !== undefined) {
    input.teamMembers = parseArrayField(body.teamMembers);
  }
  return input;
}

async function uploadProjectImages(
  files: Express.Multer.File[] | undefined,
): Promise<string[]> {
  const imageUrls: string[] = [];
  if (!files?.length) {
    return imageUrls;
  }

  for (const file of files) {
    try {
      const uploadResult = await uploadImage(file);
      imageUrls.push(uploadResult.secure_url);
    } catch (err) {
      console.error('Cloudinary upload failed for project image:', err);
    }
  }
  return imageUrls;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const featured = req.query.featured as string | undefined;
    const isFeatured =
      featured === 'true' ? true : featured === 'false' ? false : undefined;

    const projects = await projectsService.findAllProjects({
      category: req.query.category as string | undefined,
      status: req.query.status as string | undefined,
      featured: isFeatured,
      search: req.query.search as string | undefined,
    });
    res.json(projects);
  }),
);

router.get(
  '/related/:slug',
  asyncHandler(async (req, res) => {
    const related = await projectsService.getRelatedProjects(routeParam(req.params.slug));
    res.json(related);
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const project = await projectsService.findProjectBySlug(routeParam(req.params.slug));
    res.json(project);
  }),
);

router.post(
  '/',
  jwtAuth,
  upload.array('uploadedImages', 10),
  asyncHandler(async (req, res) => {
    const dto = parseProjectBody(req.body);
    const uploadedUrls = await uploadProjectImages(
      req.files as Express.Multer.File[] | undefined,
    );
    if (uploadedUrls.length > 0) {
      dto.images = [...(dto.images || []), ...uploadedUrls];
    }
    const project = await projectsService.createProject(dto);
    res.status(201).json(project);
  }),
);

router.put(
  '/:id',
  jwtAuth,
  upload.array('uploadedImages', 10),
  asyncHandler(async (req, res) => {
    const dto = parseUpdateProjectBody(req.body);
    const uploadedUrls = await uploadProjectImages(
      req.files as Express.Multer.File[] | undefined,
    );
    if (uploadedUrls.length > 0) {
      dto.images = [...(dto.images || []), ...uploadedUrls];
    }
    const project = await projectsService.updateProject(routeParam(req.params.id), dto);
    res.json(project);
  }),
);

router.delete(
  '/:id',
  jwtAuth,
  asyncHandler(async (req, res) => {
    const result = await projectsService.removeProject(routeParam(req.params.id));
    res.json(result);
  }),
);

export default router;
