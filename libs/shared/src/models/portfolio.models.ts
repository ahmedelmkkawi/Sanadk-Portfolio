export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  skills: string[];
  socialLinks?: SocialLinks;
  projects?: string[] | Project[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
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
  teamMembers: string[] | TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  admin: {
    id: string;
    email: string;
  };
}

export interface DashboardStats {
  totalProjects: number;
  totalMembers: number;
  featuredCount: number;
  publishedCount: number;
  draftCount: number;
  uniqueCategories: number;
  uniqueTechnologies: number;
  categoryBreakdown: { category: string; count: number }[];
  technologies: string[];
}
