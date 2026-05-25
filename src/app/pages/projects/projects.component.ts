import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '@shared/services/portfolio.service';
import { Project } from '@shared/models/portfolio.models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  // Reactive Signals State
  projects = signal<Project[]>([]);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  selectedTech = signal<string>('All');

  categories = computed(() => {
    const list = this.projects().map(p => p.category);
    return ['All', ...Array.from(new Set(list))];
  });

  technologies = computed(() => {
    const list: string[] = [];
    this.projects().forEach(p => p.technologies?.forEach(t => list.push(t)));
    return ['All', ...Array.from(new Set(list))];
  });

  filteredProjects = computed(() => {
    return this.projects().filter(p => {
      const matchesSearch = this.searchQuery() === '' ||
        p.title.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchQuery().toLowerCase());

      const matchesCategory = this.selectedCategory() === 'All' || p.category === this.selectedCategory();

      const matchesTech = this.selectedTech() === 'All' || p.technologies?.includes(this.selectedTech());

      return matchesSearch && matchesCategory && matchesTech && p.status === 'published';
    });
  });

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.portfolioService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  openProjectDetails(slug: string): void {
    this.router.navigate(['/projects', slug]);
  }
}
