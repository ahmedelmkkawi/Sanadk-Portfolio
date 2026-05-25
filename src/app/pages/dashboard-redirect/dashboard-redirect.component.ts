import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="min-h-screen flex items-center justify-center text-center p-8">Redirecting to the admin dashboard...</div>',
})
export class DashboardRedirectComponent implements OnInit {
  ngOnInit(): void {
    window.location.href = 'http://localhost:4201/dashboard/login';
  }
}
