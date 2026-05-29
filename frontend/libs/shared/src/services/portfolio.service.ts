import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, TeamMember, DashboardStats } from '../models/portfolio.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProjects(filters?: { category?: string; status?: string; featured?: boolean; search?: string }): Observable<Project[]> {
    let url = `${this.baseUrl}/projects`;
    const params: string[] = [];

    if (filters) {
      if (filters.category) params.push(`category=${encodeURIComponent(filters.category)}`);
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.featured !== undefined) params.push(`featured=${filters.featured}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<Project[]>(url);
  }

  getProjectBySlug(slug: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${slug}`);
  }

  getRelatedProjects(slug: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/related/${slug}`);
  }

  createProject(formData: FormData): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, formData);
  }

  updateProject(id: string, formData: FormData): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, formData);
  }

  deleteProject(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/projects/${id}`);
  }

  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/team-members`);
  }

  getTeamMember(id: string): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.baseUrl}/team-members/${id}`);
  }

  createTeamMember(formData: FormData): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.baseUrl}/team-members`, formData);
  }

  updateTeamMember(id: string, formData: FormData): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.baseUrl}/team-members/${id}`, formData);
  }

  deleteTeamMember(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/team-members/${id}`);
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }
}
