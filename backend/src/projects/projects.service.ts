import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TeamMember, TeamMemberDocument } from '../schemas/team-member.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(TeamMember.name) private teamMemberModel: Model<TeamMemberDocument>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const slug = this.generateSlug(createProjectDto.title);
    
    // Convert teamMembers strings to ObjectId
    const memberIds = (createProjectDto.teamMembers || []).map(id => new Types.ObjectId(id));
    
    const createdProject = new this.projectModel({
      ...createProjectDto,
      slug,
      teamMembers: memberIds,
    });
    
    const project = await createdProject.save();

    // Bi-directionally link project to team members
    if (memberIds.length > 0) {
      await this.teamMemberModel.updateMany(
        { _id: { $in: memberIds } },
        { $addToSet: { projects: project._id } }
      );
    }

    return project;
  }

  async findAll(query: { category?: string; status?: string; featured?: boolean; search?: string }): Promise<Project[]> {
    const filter: any = {};

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

    return this.projectModel
      .find(filter)
      .populate('teamMembers')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(slug: string): Promise<Project> {
    const project = await this.projectModel
      .findOne({ slug })
      .populate('teamMembers')
      .exec();
      
    if (!project) {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const existingProject = await this.projectModel.findById(id);
    if (!existingProject) {
      throw new NotFoundException(`Project not found`);
    }

    const updates: any = { ...updateProjectDto };
    if (updateProjectDto.title) {
      updates.slug = this.generateSlug(updateProjectDto.title);
    }

    // Convert member strings to ObjectIds
    let newMemberIds: Types.ObjectId[] | undefined;
    if (updateProjectDto.teamMembers) {
      newMemberIds = updateProjectDto.teamMembers.map(mid => new Types.ObjectId(mid));
      updates.teamMembers = newMemberIds;
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updates, { new: true })
      .populate('teamMembers')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException('Project updated failed');
    }

    // Sync team member relations bi-directionally
    if (newMemberIds) {
      const oldMemberIds = existingProject.teamMembers.map(m => m.toString());
      const added = newMemberIds.filter(x => !oldMemberIds.includes(x.toString()));
      const removed = oldMemberIds.filter(x => !newMemberIds!.map(n => n.toString()).includes(x));

      if (added.length > 0) {
        await this.teamMemberModel.updateMany(
          { _id: { $in: added } },
          { $addToSet: { projects: updatedProject._id } }
        );
      }
      if (removed.length > 0) {
        await this.teamMemberModel.updateMany(
          { _id: { $in: removed } },
          { $pull: { projects: updatedProject._id } }
        );
      }
    }

    return updatedProject;
  }

  async remove(id: string): Promise<any> {
    const project = await this.projectModel.findByIdAndDelete(id);
    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    // Unlink project from all team members
    await this.teamMemberModel.updateMany(
      { projects: id },
      { $pull: { projects: id } }
    );

    return { deleted: true };
  }

  async getRelated(slug: string): Promise<Project[]> {
    const project = await this.findOne(slug);
    return this.projectModel
      .find({
        category: project.category,
        slug: { $ne: slug },
        status: 'published'
      })
      .limit(3)
      .exec();
  }
}
