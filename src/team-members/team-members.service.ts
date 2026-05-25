import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TeamMember, TeamMemberDocument } from '../schemas/team-member.schema';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class TeamMembersService {
  constructor(
    @InjectModel(TeamMember.name) private teamMemberModel: Model<TeamMemberDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createTeamMemberDto: CreateTeamMemberDto): Promise<TeamMember> {
    const projectIds = (createTeamMemberDto.projects || []).map(pid => new Types.ObjectId(pid));
    
    const createdMember = new this.teamMemberModel({
      ...createTeamMemberDto,
      projects: projectIds,
    });

    const member = await createdMember.save();

    // Bi-directionally link member to projects
    if (projectIds.length > 0) {
      await this.projectModel.updateMany(
        { _id: { $in: projectIds } },
        { $addToSet: { teamMembers: member._id } }
      );
    }

    return member;
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamMemberModel
      .find()
      .populate('projects')
      .exec();
  }

  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamMemberModel
      .findById(id)
      .populate('projects')
      .exec();
      
    if (!member) {
      throw new NotFoundException(`Team member not found`);
    }
    return member;
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto): Promise<TeamMember> {
    const existingMember = await this.teamMemberModel.findById(id);
    if (!existingMember) {
      throw new NotFoundException(`Team member not found`);
    }

    const updates: any = { ...updateTeamMemberDto };

    let newProjectIds: Types.ObjectId[] | undefined;
    if (updateTeamMemberDto.projects) {
      newProjectIds = updateTeamMemberDto.projects.map(pid => new Types.ObjectId(pid));
      updates.projects = newProjectIds;
    }

    const updatedMember = await this.teamMemberModel
      .findByIdAndUpdate(id, updates, { new: true })
      .populate('projects')
      .exec();

    if (!updatedMember) {
      throw new NotFoundException('Update failed');
    }

    // Sync project relations bi-directionally
    if (newProjectIds) {
      const oldProjectIds = existingMember.projects.map(p => p.toString());
      const added = newProjectIds.filter(x => !oldProjectIds.includes(x.toString()));
      const removed = oldProjectIds.filter(x => !newProjectIds!.map(n => n.toString()).includes(x));

      if (added.length > 0) {
        await this.projectModel.updateMany(
          { _id: { $in: added } },
          { $addToSet: { teamMembers: updatedMember._id } }
        );
      }
      if (removed.length > 0) {
        await this.projectModel.updateMany(
          { _id: { $in: removed } },
          { $pull: { teamMembers: updatedMember._id } }
        );
      }
    }

    return updatedMember;
  }

  async remove(id: string): Promise<any> {
    const member = await this.teamMemberModel.findByIdAndDelete(id);
    if (!member) {
      throw new NotFoundException(`Team member not found`);
    }

    // Unlink member from all projects
    await this.projectModel.updateMany(
      { teamMembers: id },
      { $pull: { teamMembers: id } }
    );

    return { deleted: true };
  }
}
