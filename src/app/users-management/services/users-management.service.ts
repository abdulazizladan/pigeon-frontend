import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserPayload } from '../models/user.model';

/** HTTP layer for /users. The Authorization header is attached by authInterceptor. */
@Injectable({ providedIn: 'root' })
export class UsersManagementService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, payload);
  }
}
