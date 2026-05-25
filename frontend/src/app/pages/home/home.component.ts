import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PortfolioService } from '@shared/services/portfolio.service';
import { Project } from '@shared/models/portfolio.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  projects = signal<Project[]>([]);
  activeSlide = signal<number>(0);
  private slideIntervalId: any;

  featuredProjects = computed(() =>
    this.projects().filter(project => project.featured && project.status === 'published')
  );

  constructor(
    private portfolioService: PortfolioService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProjects();
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  loadFeaturedProjects(): void {
    this.portfolioService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load featured projects', err),
    });
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.slideIntervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay(): void {
    if (this.slideIntervalId) {
      clearInterval(this.slideIntervalId);
    }
  }

  nextSlide(): void {
    const total = this.featuredProjects().length;
    if (total > 0) {
      this.activeSlide.set((this.activeSlide() + 1) % total);
    }
  }

  prevSlide(): void {
    const total = this.featuredProjects().length;
    if (total > 0) {
      this.activeSlide.set((this.activeSlide() - 1 + total) % total);
    }
  }

  setSlide(index: number): void {
    this.activeSlide.set(index);
    this.resetAutoPlay();
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  openProjectDetails(slug: string): void {
    this.router.navigate(['/projects', slug]);
  }
}

