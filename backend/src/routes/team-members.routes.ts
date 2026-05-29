import { Router } from 'express';
import multer from 'multer';
import { jwtAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/async-handler';
import { parseArrayField, parseObjectField } from '../utils/form-fields';
import * as teamMembersService from '../services/team-members.service';
import { uploadImage } from '../services/cloudinary.service';
import { SocialLinks } from '../models/team-member.model';
import {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
} from '../services/team-members.service';
import { routeParam } from '../utils/params';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseTeamMemberBody(body: Record<string, unknown>): CreateTeamMemberInput {
  return {
    name: String(body.name || ''),
    role: String(body.role || ''),
    image: body.image ? String(body.image) : undefined,
    bio: body.bio ? String(body.bio) : undefined,
    skills: parseArrayField(body.skills),
    socialLinks: parseObjectField<SocialLinks>(body.socialLinks),
    projects: parseArrayField(body.projects),
  };
}

function parseUpdateTeamMemberBody(
  body: Record<string, unknown>,
): UpdateTeamMemberInput {
  const input: UpdateTeamMemberInput = {};
  if (body.name !== undefined) input.name = String(body.name);
  if (body.role !== undefined) input.role = String(body.role);
  if (body.image !== undefined) input.image = String(body.image);
  if (body.bio !== undefined) input.bio = String(body.bio);
  if (body.skills !== undefined) input.skills = parseArrayField(body.skills);
  if (body.socialLinks !== undefined) {
    input.socialLinks = parseObjectField<SocialLinks>(body.socialLinks);
  }
  if (body.projects !== undefined) input.projects = parseArrayField(body.projects);
  return input;
}

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const members = await teamMembersService.findAllTeamMembers();
    res.json(members);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const member = await teamMembersService.findTeamMemberById(routeParam(req.params.id));
    res.json(member);
  }),
);

router.post(
  '/',
  jwtAuth,
  upload.single('uploadedImage'),
  asyncHandler(async (req, res) => {
    const dto = parseTeamMemberBody(req.body);
    const file = req.file;
    if (file) {
      try {
        const uploadResult = await uploadImage(file);
        dto.image = uploadResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed for team member image:', err);
      }
    }
    const member = await teamMembersService.createTeamMember(dto);
    res.status(201).json(member);
  }),
);

router.put(
  '/:id',
  jwtAuth,
  upload.single('uploadedImage'),
  asyncHandler(async (req, res) => {
    const dto = parseUpdateTeamMemberBody(req.body);
    const file = req.file;
    if (file) {
      try {
        const uploadResult = await uploadImage(file);
        dto.image = uploadResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed for team member image (update):', err);
      }
    }
    const member = await teamMembersService.updateTeamMember(routeParam(req.params.id), dto);
    res.json(member);
  }),
);

router.delete(
  '/:id',
  jwtAuth,
  asyncHandler(async (req, res) => {
    const result = await teamMembersService.removeTeamMember(routeParam(req.params.id));
    res.json(result);
  }),
);

export default router;
