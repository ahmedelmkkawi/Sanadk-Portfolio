import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PortfolioService } from '@shared/services/portfolio.service';
import { TeamMember } from '@shared/models/portfolio.models';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './team.component.html',
})
export class TeamComponent implements OnInit {
  team = signal<TeamMember[]>([]);

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadTeam();
  }

  loadTeam(): void {
    this.portfolioService.getTeamMembers().subscribe({
      next: (data) => this.team.set(data),
      error: (err) => console.error('Failed to load team members', err)
    });
  }

  formatSocialLink(url?: string | null): string | null {
    if (!url) {
      return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
      return null;
    }

    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
      return trimmed;
    }

    return `https://${trimmed}`;
  }
}
