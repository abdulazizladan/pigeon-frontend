import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginPayload, LoginResponse } from './models/auth.model';

/**
 * Thin HTTP layer for the auth endpoints. Holds no state; the AuthStore owns
 * the session. The Authorization header is attached by authInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(payload: Pick<LoginPayload, 'username' | 'password'>): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload);
  }
}
