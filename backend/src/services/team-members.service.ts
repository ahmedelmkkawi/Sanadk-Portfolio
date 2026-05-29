import { Types } from 'mongoose';
import { TeamMember } from '../models/team-member.model';
import { Project } from '../models/project.model';
import { HttpError } from '../utils/http-error';
import { SocialLinks } from '../models/team-member.model';

export interface CreateTeamMemberInput {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: SocialLinks;
  projects?: string[];
}

export type UpdateTeamMemberInput = Partial<CreateTeamMemberInput>;

export async function createTeamMember(input: CreateTeamMemberInput) {
  const projectIds = (input.projects || []).map((pid) => new Types.ObjectId(pid));

  const member = await TeamMember.create({
    ...input,
    projects: projectIds,
  });

  if (projectIds.length > 0) {
    await Project.updateMany(
      { _id: { $in: projectIds } },
      { $addToSet: { teamMembers: member._id } },
    );
  }

  return member;
}

export async function findAllTeamMembers() {
  return TeamMember.find().populate('projects');
}

export async function findTeamMemberById(id: string) {
  const member = await TeamMember.findById(id).populate('projects');
  if (!member) {
    throw new HttpError(404, 'Team member not found');
  }
  return member;
}

export async function updateTeamMember(id: string, input: UpdateTeamMemberInput) {
  const existingMember = await TeamMember.findById(id);
  if (!existingMember) {
    throw new HttpError(404, 'Team member not found');
  }

  const updates: Record<string, unknown> = { ...input };

  let newProjectIds: Types.ObjectId[] | undefined;
  if (input.projects) {
    newProjectIds = input.projects.map((pid) => new Types.ObjectId(pid));
    updates.projects = newProjectIds;
  }

  const updatedMember = await TeamMember.findByIdAndUpdate(id, updates, {
    new: true,
  }).populate('projects');

  if (!updatedMember) {
    throw new HttpError(404, 'Update failed');
  }

  if (newProjectIds) {
    const oldProjectIds = existingMember.projects.map((p) => p.toString());
    const added = newProjectIds.filter((x) => !oldProjectIds.includes(x.toString()));
    const removed = oldProjectIds.filter(
      (x) => !newProjectIds!.map((n) => n.toString()).includes(x),
    );

    if (added.length > 0) {
      await Project.updateMany(
        { _id: { $in: added } },
        { $addToSet: { teamMembers: updatedMember._id } },
      );
    }
    if (removed.length > 0) {
      await Project.updateMany(
        { _id: { $in: removed } },
        { $pull: { teamMembers: updatedMember._id } },
      );
    }
  }

  return updatedMember;
}

export async function removeTeamMember(id: string) {
  const member = await TeamMember.findByIdAndDelete(id);
  if (!member) {
    throw new HttpError(404, 'Team member not found');
  }

  await Project.updateMany({ teamMembers: id }, { $pull: { teamMembers: id } });

  return { deleted: true };
}
