import { Routes } from '@angular/router';
import { authGuard } from '@shared/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/login',
    loadComponent: () => import('./pages/dashboard/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'dashboard/login',
  },
];
