import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SalesQuery, SalesSummary } from '../models/sales.model';

/** HTTP layer for /sales. The Authorization header is attached by authInterceptor. */
@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  getSummary(query: SalesQuery): Observable<SalesSummary> {
    let params = new HttpParams().set('from', query.from).set('to', query.to);
    if (query.stationId) params = params.set('stationId', query.stationId);
    return this.http.get<SalesSummary>(`${this.baseUrl}/summary`, { params });
  }
}
