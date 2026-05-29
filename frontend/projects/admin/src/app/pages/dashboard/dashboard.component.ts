import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '@shared/services/portfolio.service';
import { Project, TeamMember, DashboardStats } from '@shared/models/portfolio.models';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  activeTab = signal<'stats' | 'projects' | 'team'>('stats');
  stats = signal<DashboardStats | null>(null);
  projects = signal<Project[]>([]);
  teamMembers = signal<TeamMember[]>([]);
  showProjectModal = signal<boolean>(false);
  showTeamModal = signal<boolean>(false);
  editingProjectId = signal<string | null>(null);
  editingTeamMemberId = signal<string | null>(null);
  projectForm = {
    title: '',
    description: '',
    category: '',
    technologies: '',
    status: 'draft',
    liveUrl: '',
    githubUrl: '',
    featured: false,
    selectedMembers: [] as string[],
  };
  teamForm = {
    name: '',
    role: '',
    bio: '',
    skills: '',
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: '',
  };
  uploadedProjectFiles: File[] = [];
  uploadedTeamFile: File | null = null;
  photoPreview: string | null = null;

  constructor(
    private portfolioService: PortfolioService,
    public toastService: ToastService
  ) {}

  switchTab(tab: 'stats' | 'projects' | 'team'): void {
    this.activeTab.set(tab);
    this.showProjectModal.set(false);
    this.showTeamModal.set(false);
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadProjects();
    this.loadTeamMembers();
  }

  loadStats(): void {
    this.portfolioService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error fetching stats', err),
    });
  }

  loadProjects(): void {
    this.portfolioService.getProjects({ status: undefined }).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Error fetching projects', err),
    });
  }

  loadTeamMembers(): void {
    this.portfolioService.getTeamMembers().subscribe({
      next: (data) => this.teamMembers.set(data),
      error: (err) => console.error('Error fetching team members', err),
    });
  }

  openAddProject(): void {
    this.editingProjectId.set(null);
    this.projectForm = {
      title: '',
      description: '',
      category: '',
      technologies: '',
      status: 'draft',
      liveUrl: '',
      githubUrl: '',
      featured: false,
      selectedMembers: [],
    };
    this.uploadedProjectFiles = [];
    this.showProjectModal.set(true);
  }

  openEditProject(proj: Project): void {
    this.editingProjectId.set(proj._id);
    this.projectForm = {
      title: proj.title,
      description: proj.description,
      category: proj.category,
      technologies: proj.technologies.join(', '),
      status: proj.status,
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      featured: proj.featured,
      selectedMembers: (proj.teamMembers as any[]).map((m) => m._id || m.toString()),
    };
    this.uploadedProjectFiles = [];
    this.showProjectModal.set(true);
  }

  toggleMemberSelection(id: string): void {
    const list = [...this.projectForm.selectedMembers];
    const index = list.indexOf(id);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(id);
    }
    this.projectForm.selectedMembers = list;
  }

  onProjectFilesChange(event: any): void {
    this.uploadedProjectFiles = Array.from(event.target.files);
  }

  submitProjectForm(): void {
    const formData = new FormData();
    formData.append('title', this.projectForm.title);
    formData.append('description', this.projectForm.description);
    formData.append('category', this.projectForm.category);
    formData.append('status', this.projectForm.status);
    formData.append('liveUrl', this.projectForm.liveUrl);
    formData.append('githubUrl', this.projectForm.githubUrl);
    formData.append('featured', String(this.projectForm.featured));

    const techArray = this.projectForm.technologies.split(',').map((t) => t.trim()).filter(Boolean);
    formData.append('technologies', JSON.stringify(techArray));
    formData.append('teamMembers', JSON.stringify(this.projectForm.selectedMembers));

    this.uploadedProjectFiles.forEach((file) => {
      formData.append('uploadedImages', file);
    });

    if (this.editingProjectId()) {
      this.portfolioService.updateProject(this.editingProjectId()!, formData).subscribe({
        next: () => {
          this.showProjectModal.set(false);
          this.loadProjects();
          this.loadStats();
          this.toastService.show('Project updated successfully!', 'success');
        },
        error: (err) => {
          console.error('Update project failed', err);
          const msg = err?.error?.message || 'Failed to update project.';
          this.toastService.show(msg, 'error');
        },
      });
    } else {
      this.portfolioService.createProject(formData).subscribe({
        next: () => {
          this.showProjectModal.set(false);
          this.loadProjects();
          this.loadStats();
          this.toastService.show('Project created successfully!', 'success');
        },
        error: (err) => {
          console.error('Create project failed', err);
          const msg = err?.error?.message || 'Failed to create project.';
          this.toastService.show(msg, 'error');
        },
      });
    }
  }

  deleteProject(id: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.portfolioService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
          this.loadStats();
          this.toastService.show('Project deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Delete project failed', err);
          this.toastService.show('Failed to delete project.', 'error');
        },
      });
    }
  }

  openAddTeamMember(): void {
    this.editingTeamMemberId.set(null);
    this.teamForm = {
      name: '',
      role: '',
      bio: '',
      skills: '',
      linkedin: '',
      github: '',
      twitter: '',
      portfolio: '',
    };
    this.uploadedTeamFile = null;
    this.photoPreview = null;
    this.showTeamModal.set(true);
  }

  openEditTeamMember(member: TeamMember): void {
    this.editingTeamMemberId.set(member._id);
    this.teamForm = {
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      skills: member.skills.join(', '),
      linkedin: member.socialLinks?.linkedin || '',
      github: member.socialLinks?.github || '',
      twitter: member.socialLinks?.twitter || '',
      portfolio: member.socialLinks?.portfolio || '',
    };
    this.uploadedTeamFile = null;
    this.photoPreview = member.image || null;
    this.showTeamModal.set(true);
  }

  onTeamFileChange(event: any): void {
    const file = event.target.files[0] || null;
    if (file && this.photoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreview);
    }
    this.uploadedTeamFile = file;
    this.photoPreview = file ? URL.createObjectURL(file) : this.photoPreview;
  }

  submitTeamForm(): void {
    const formData = new FormData();
    formData.append('name', this.teamForm.name);
    formData.append('role', this.teamForm.role);
    formData.append('bio', this.teamForm.bio);

    const skillsArray = this.teamForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
    formData.append('skills', JSON.stringify(skillsArray));

    const socials = {
      linkedin: this.teamForm.linkedin,
      github: this.teamForm.github,
      twitter: this.teamForm.twitter,
      portfolio: this.teamForm.portfolio,
    };
    formData.append('socialLinks', JSON.stringify(socials));

    if (this.uploadedTeamFile) {
      formData.append('uploadedImage', this.uploadedTeamFile);
    }

    if (this.editingTeamMemberId()) {
      this.portfolioService.updateTeamMember(this.editingTeamMemberId()!, formData).subscribe({
        next: () => {
          this.showTeamModal.set(false);
          this.loadTeamMembers();
          this.loadStats();
          this.toastService.show('Team member updated successfully!', 'success');
        },
        error: (err) => {
          console.error('Update team member failed', err);
          const msg = err?.error?.message || 'Failed to update team member.';
          this.toastService.show(msg, 'error');
        },
      });
    } else {
      this.portfolioService.createTeamMember(formData).subscribe({
        next: () => {
          this.showTeamModal.set(false);
          this.loadTeamMembers();
          this.loadStats();
          this.toastService.show('Team member added successfully!', 'success');
        },
        error: (err) => {
          console.error('Create team member failed', err);
          const msg = err?.error?.message || 'Failed to add team member.';
          this.toastService.show(msg, 'error');
        },
      });
    }
  }

  deleteTeamMember(id: string): void {
    if (confirm('Are you sure you want to delete this team member?')) {
      this.portfolioService.deleteTeamMember(id).subscribe({
        next: () => {
          this.loadTeamMembers();
          this.loadStats();
          this.toastService.show('Team member deleted successfully!', 'success');
        },
        error: (err) => {
          console.error('Delete team member failed', err);
          this.toastService.show('Failed to delete team member.', 'error');
        },
      });
    }
  }
}
