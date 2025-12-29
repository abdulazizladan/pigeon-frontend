import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { LoginData } from '../models/loginData.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom, map, BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  id: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user from token on service initialization
    this.loadUserFromToken();
  }

  async login(data: LoginData): Promise<string> {
    const loginUrl = `${environment.baseUrl}/auth/login`;
    const token = await firstValueFrom(
      this.http.post<{ access_token: string }>(loginUrl, data).pipe(
        map(response => response.access_token),
        tap(token => {
          // Store token
          localStorage.setItem('access_token', token);
          // Decode and store user info
          this.loadUserFromToken();
        })
      )
    );
    return token;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const payload = this.decodeToken(token);
        this.currentUserSubject.next({
          id: payload.id,
          email: payload.email,
          role: payload.role
        });
      } catch (error) {
        console.error('Invalid token', error);
        this.logout();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role || null;
  }

  changePassword(data: { oldPassword: string, newPassword: string }) {
    const url = `${environment.baseUrl}/auth/change-password`;
    return firstValueFrom(
      this.http.patch<void>(url, data)
    );
  }
}
