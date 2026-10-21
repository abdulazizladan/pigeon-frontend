import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateHealthCheckPayload,
  CreateRepairRequestPayload,
  DecideRepairRequestPayload,
  HealthCheckReport,
  HealthCheckTemplate,
  HealthChecksQuery,
  RepairRequest,
  RepairRequestStats,
  RepairRequestsQuery,
  UpdateHealthCheckPayload,
} from '../models/maintenance.model';

/** HTTP layer for /health-checks and /repair-requests. Auth header comes from authInterceptor. */
@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private stationParams(stationId: string | null): HttpParams | undefined {
    return stationId ? new HttpParams().set('stationId', stationId) : undefined;
  }

  // ---- health checks ----
  getHealthChecks(query: HealthChecksQuery): Observable<HealthCheckReport[]> {
    let params = new HttpParams().set('from', query.from).set('to', query.to);
    if (query.stationId) params = params.set('stationId', query.stationId);
    return this.http.get<HealthCheckReport[]>(`${this.api}/health-checks`, { params });
  }

  getLatestHealthCheck(stationId: string | null): Observable<HealthCheckReport | null> {
    return this.http
      .get<HealthCheckReport | null>(`${this.api}/health-checks/latest`, { params: this.stationParams(stationId) })
      .pipe(map((r) => r ?? null));
  }

  getHealthCheckTemplate(stationId: string | null): Observable<HealthCheckTemplate> {
    return this.http.get<HealthCheckTemplate>(`${this.api}/health-checks/template`, { params: this.stationParams(stationId) });
  }

  createHealthCheck(payload: CreateHealthCheckPayload): Observable<HealthCheckReport> {
    return this.http.post<HealthCheckReport>(`${this.api}/health-checks`, payload);
  }

  updateHealthCheck(id: string, payload: UpdateHealthCheckPayload): Observable<HealthCheckReport> {
    return this.http.put<HealthCheckReport>(`${this.api}/health-checks/${id}`, payload);
  }

  // ---- repair requests ----
  getRepairRequests(query: RepairRequestsQuery): Observable<RepairRequest[]> {
    let params = new HttpParams();
    if (query.stationId) params = params.set('stationId', query.stationId);
    if (query.status) params = params.set('status', query.status);
    if (query.priority) params = params.set('priority', query.priority);
    return this.http.get<RepairRequest[]>(`${this.api}/repair-requests`, { params });
  }

  getRepairStats(stationId: string | null): Observable<RepairRequestStats> {
    return this.http.get<RepairRequestStats>(`${this.api}/repair-requests/stats`, { params: this.stationParams(stationId) });
  }

  createRepairRequest(payload: CreateRepairRequestPayload): Observable<RepairRequest> {
    return this.http.post<RepairRequest>(`${this.api}/repair-requests`, payload);
  }

  decideRepairRequest(id: string, payload: DecideRepairRequestPayload): Observable<RepairRequest> {
    return this.http.patch<RepairRequest>(`${this.api}/repair-requests/${id}/decision`, payload);
  }
}
