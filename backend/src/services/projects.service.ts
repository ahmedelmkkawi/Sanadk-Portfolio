import { Types } from 'mongoose';
import { Project } from '../models/project.model';
import { TeamMember } from '../models/team-member.model';
import { HttpError } from '../utils/http-error';
import { generateSlug } from '../utils/slug';

export interface CreateProjectInput {
  title: string;
  description: string;
  images?: string[];
  technologies?: string[];
  category: string;
  status?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  teamMembers?: string[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

export async function createProject(input: CreateProjectInput) {
  const slug = generateSlug(input.title);
  const memberIds = (input.teamMembers || []).map((id) => new Types.ObjectId(id));

  const project = await Project.create({
    ...input,
    slug,
    teamMembers: memberIds,
  });

  if (memberIds.length > 0) {
    await TeamMember.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { projects: project._id } },
    );
  }

  return project;
}

export async function findAllProjects(query: {
  category?: string;
  status?: string;
  featured?: boolean;
  search?: string;
}) {
  const filter: Record<string, unknown> = {};

  if (query.category) {
    filter.category = new RegExp(query.category, 'i');
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.featured !== undefined) {
    filter.featured = query.featured;
  }
  if (query.search) {
    filter.$or = [
      { title: new RegExp(query.search, 'i') },
      { description: new RegExp(query.search, 'i') },
      { technologies: new RegExp(query.search, 'i') },
    ];
  }

  return Project.find(filter).populate('teamMembers').sort({ createdAt: -1 });
}

export async function findProjectBySlug(slug: string) {
  const project = await Project.findOne({ slug }).populate('teamMembers');
  if (!project) {
    throw new HttpError(404, `Project with slug ${slug} not found`);
  }
  return project;
}

export async function updateProject(id: string, input: UpdateProjectInput) {
  const existingProject = await Project.findById(id);
  if (!existingProject) {
    throw new HttpError(404, 'Project not found');
  }

  const updates: Record<string, unknown> = { ...input };
  if (input.title) {
    updates.slug = generateSlug(input.title);
  }

  let newMemberIds: Types.ObjectId[] | undefined;
  if (input.teamMembers) {
    newMemberIds = input.teamMembers.map((mid) => new Types.ObjectId(mid));
    updates.teamMembers = newMemberIds;
  }

  const updatedProject = await Project.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate('teamMembers');

  if (!updatedProject) {
    throw new HttpError(404, 'Project updated failed');
  }

  if (newMemberIds) {
    const oldMemberIds = existingProject.teamMembers.map((m) => m.toString());
    const added = newMemberIds.filter((x) => !oldMemberIds.includes(x.toString()));
    const removed = oldMemberIds.filter(
      (x) => !newMemberIds!.map((n) => n.toString()).includes(x),
    );

    if (added.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: added } },
        { $addToSet: { projects: updatedProject._id } },
      );
    }
    if (removed.length > 0) {
      await TeamMember.updateMany(
        { _id: { $in: removed } },
        { $pull: { projects: updatedProject._id } },
      );
    }
  }

  return updatedProject;
}

export async function removeProject(id: string) {
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  await TeamMember.updateMany({ projects: id }, { $pull: { projects: id } });

  return { deleted: true };
}

export async function getRelatedProjects(slug: string) {
  const project = await findProjectBySlug(slug);
  return Project.find({
    category: project.category,
    slug: { $ne: slug },
    status: 'published',
  }).limit(3);
}
