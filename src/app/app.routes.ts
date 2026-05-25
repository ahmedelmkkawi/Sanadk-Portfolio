import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then((c) => c.ProjectsComponent),
  },
  {
    path: 'projects/:slug',
    loadComponent: () => import('./pages/project-details/project-details.component').then((c) => c.ProjectDetailsComponent),
  },
  {
    path: 'team',
    loadComponent: () => import('./pages/team/team.component').then((c) => c.TeamComponent),
  },
  {
    path: 'dashboard/login',
    loadComponent: () => import('./pages/dashboard-redirect/dashboard-redirect.component').then((c) => c.DashboardRedirectComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-redirect/dashboard-redirect.component').then((c) => c.DashboardRedirectComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
