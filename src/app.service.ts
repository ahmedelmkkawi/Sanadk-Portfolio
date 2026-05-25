import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { TeamMember, TeamMemberDocument } from './schemas/team-member.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(TeamMember.name) private teamMemberModel: Model<TeamMemberDocument>,
  ) {}

  getHello(): string {
    return '🚀 Sanadak Software Agency Portfolio API is running!';
  }

  async getStats(): Promise<any> {
    const [
      totalProjects,
      totalMembers,
      featuredCount,
      publishedCount,
      draftCount,
      categories,
      projects,
    ] = await Promise.all([
      this.projectModel.countDocuments(),
      this.teamMemberModel.countDocuments(),
      this.projectModel.countDocuments({ featured: true }),
      this.projectModel.countDocuments({ status: 'published' }),
      this.projectModel.countDocuments({ status: 'draft' }),
      this.projectModel.distinct('category'),
      this.projectModel.find({}, 'technologies').exec(),
    ]);

    // Unique technologies count
    const techSet = new Set<string>();
    projects.forEach(p => {
      p.technologies?.forEach(t => techSet.add(t));
    });

    // Breakdown of categories
    const categoryBreakdown = await this.projectModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    return {
      totalProjects,
      totalMembers,
      featuredCount,
      publishedCount,
      draftCount,
      uniqueCategories: categories.length,
      uniqueTechnologies: techSet.size,
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c._id || 'Uncategorized',
        count: c.count,
      })),
      technologies: Array.from(techSet),
    };
  }
}
