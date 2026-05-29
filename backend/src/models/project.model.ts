import mongoose, { Document, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  images: string[];
  technologies: string[];
  category: string;
  status: 'draft' | 'published';
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  teamMembers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    liveUrl: String,
    githubUrl: String,
    featured: { type: Boolean, default: false },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeamMember' }],
  },
  { timestamps: true },
);

export const Project = mongoose.model<IProject>('Project', projectSchema);
