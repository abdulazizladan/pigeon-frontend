import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateDailyRecordPayload,
  DailyRecordTemplate,
  DailyRecordsQuery,
  DailySalesReport,
  UpdateDailyRecordPayload,
} from '../models/daily-sales.model';

/** HTTP layer for /sales/daily. Auth header comes from authInterceptor. */
@Injectable({ providedIn: 'root' })
export class DailySalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales/daily`;

  getRecords(query: DailyRecordsQuery): Observable<DailySalesReport[]> {
    let params = new HttpParams().set('from', query.from).set('to', query.to);
    if (query.stationId) params = params.set('stationId', query.stationId);
    return this.http.get<DailySalesReport[]>(this.baseUrl, { params });
  }

  getRecord(id: string): Observable<DailySalesReport> {
    return this.http.get<DailySalesReport>(`${this.baseUrl}/${id}`);
  }

  getTemplate(stationId: string | null): Observable<DailyRecordTemplate> {
    const params = stationId ? new HttpParams().set('stationId', stationId) : undefined;
    return this.http.get<DailyRecordTemplate>(`${this.baseUrl}/template`, { params });
  }

  createRecord(payload: CreateDailyRecordPayload): Observable<DailySalesReport> {
    return this.http.post<DailySalesReport>(this.baseUrl, payload);
  }

  updateRecord(id: string, payload: UpdateDailyRecordPayload): Observable<DailySalesReport> {
    return this.http.put<DailySalesReport>(`${this.baseUrl}/${id}`, payload);
  }
}
