import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/portfolio.models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private get apiUrl(): string {
    return `${environment.apiUrl}/auth`;
  }
  private tokenSignal = signal<string | null>(localStorage.getItem('access_token'));
  public isLoggedIn = computed(() => !!this.tokenSignal());

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
        this.tokenSignal.set(res.access_token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.tokenSignal.set(null);
    this.router.navigate(['/dashboard/login']);
  }
}
