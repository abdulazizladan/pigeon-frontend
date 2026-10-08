import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Manager } from '../models/manager.model';
import { UserStatus } from '../../users-management/models/user.model';

/** HTTP layer for /managers. The Authorization header is attached by authInterceptor. */
@Injectable({ providedIn: 'root' })
export class ManagersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/managers`;

  getManagers(status?: UserStatus): Observable<Manager[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Manager[]>(this.baseUrl, { params });
  }
}
