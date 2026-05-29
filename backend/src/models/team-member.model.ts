import mongoose, { Document, Types } from 'mongoose';

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface ITeamMember extends Document {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  skills: string[];
  socialLinks?: SocialLinks;
  projects: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const socialLinksSchema = new mongoose.Schema<SocialLinks>(
  {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String,
  },
  { _id: false },
);

const teamMemberSchema = new mongoose.Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: String,
    bio: String,
    skills: { type: [String], default: [] },
    socialLinks: socialLinksSchema,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
);

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
