import { Project } from '../models/project.model';
import { TeamMember } from '../models/team-member.model';

export async function getStats() {
  const [
    totalProjects,
    totalMembers,
    featuredCount,
    publishedCount,
    draftCount,
    categories,
    projects,
  ] = await Promise.all([
    Project.countDocuments(),
    TeamMember.countDocuments(),
    Project.countDocuments({ featured: true }),
    Project.countDocuments({ status: 'published' }),
    Project.countDocuments({ status: 'draft' }),
    Project.distinct('category'),
    Project.find({}, 'technologies'),
  ]);

  const techSet = new Set<string>();
  projects.forEach((p) => {
    p.technologies?.forEach((t) => techSet.add(t));
  });

  const categoryBreakdown = await Project.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  return {
    totalProjects,
    totalMembers,
    featuredCount,
    publishedCount,
    draftCount,
    uniqueCategories: categories.length,
    uniqueTechnologies: techSet.size,
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c._id || 'Uncategorized',
      count: c.count,
    })),
    technologies: Array.from(techSet),
  };
}
