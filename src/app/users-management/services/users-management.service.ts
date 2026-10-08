import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserPayload } from '../models/user.model';
import { Activity } from '../models/activity.model';

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

  /** A user's activities, newest first. Pass the oldest shown row as the cursor to page further back. Admin only. */
  getUserActivities(id: string, limit = 50, cursor?: Pick<Activity, 'createdAt' | 'id'>): Observable<Activity[]> {
    let params = new HttpParams().set('limit', String(limit));
    if (cursor) params = params.set('before', cursor.createdAt).set('beforeId', cursor.id);
    return this.http.get<Activity[]>(`${environment.apiUrl}/users/${id}/activities`, { params });
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, payload);
  }
}
