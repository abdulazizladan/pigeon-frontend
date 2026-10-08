import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStationPayload, Station, StationStats, UpdateStationPayload } from '../models/station.model';

/** HTTP layer for /stations. The Authorization header is attached by authInterceptor. */
@Injectable({ providedIn: 'root' })
export class StationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/stations`;

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(this.baseUrl);
  }

  /** The station assigned to the logged-in user. The API returns an empty body when there is none. */
  getMyStation(): Observable<Station | null> {
    return this.http.get<Station | null>(`${this.baseUrl}/mine`).pipe(map((s) => s ?? null));
  }

  getStats(): Observable<StationStats> {
    return this.http.get<StationStats>(`${this.baseUrl}/stats`);
  }

  createStation(payload: CreateStationPayload): Observable<Station> {
    return this.http.post<Station>(this.baseUrl, payload);
  }

  updateStation(id: string, payload: UpdateStationPayload): Observable<Station> {
    return this.http.patch<Station>(`${this.baseUrl}/${id}`, payload);
  }
}
