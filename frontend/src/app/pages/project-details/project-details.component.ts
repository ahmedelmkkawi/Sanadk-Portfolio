import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PortfolioService } from '@shared/services/portfolio.service';
import { Project } from '@shared/models/portfolio.models';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-details.component.html',
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  project = signal<Project | null>(null);
  relatedProjects = signal<Project[]>([]);
  activeImageIndex = signal<number>(0);
  loading = signal<boolean>(true);
  private slideIntervalId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadProjectDetails(slug);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  loadProjectDetails(slug: string): void {
    this.loading.set(true);
    this.portfolioService.getProjectBySlug(slug).subscribe({
      next: (data) => {
        this.project.set(data);
        this.activeImageIndex.set(0);
        this.startAutoSlide();
        this.loading.set(false);
        this.loadRelated(slug);
      },
      error: (err) => {
        console.error('Failed to load project details', err);
        this.loading.set(false);
      }
    });
  }

  loadRelated(slug: string): void {
    this.portfolioService.getRelatedProjects(slug).subscribe({
      next: (data) => this.relatedProjects.set(data),
      error: (err) => console.error('Failed to load related projects', err)
    });
  }

  private startAutoSlide(): void {
    this.stopAutoSlide();
    const images = this.project()?.images ?? [];
    if (images.length <= 1) {
      return;
    }

    this.slideIntervalId = window.setInterval(() => {
      this.nextImage();
    }, 5000);
  }

  private stopAutoSlide(): void {
    if (this.slideIntervalId !== null) {
      window.clearInterval(this.slideIntervalId);
      this.slideIntervalId = null;
    }
  }

  prevImage(): void {
    const images = this.project()?.images ?? [];
    if (!images.length) {
      return;
    }
    const nextIndex = (this.activeImageIndex() - 1 + images.length) % images.length;
    this.activeImageIndex.set(nextIndex);
    this.restartAutoSlide();
  }

  nextImage(): void {
    const images = this.project()?.images ?? [];
    if (!images.length) {
      return;
    }
    const nextIndex = (this.activeImageIndex() + 1) % images.length;
    this.activeImageIndex.set(nextIndex);
  }

  goToImage(index: number): void {
    this.activeImageIndex.set(index);
    this.restartAutoSlide();
  }

  restartAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}
