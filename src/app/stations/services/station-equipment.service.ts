import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePumpPayload,
  CreateReservoirPayload,
  Product,
  ProductPrice,
  Pump,
  Reservoir,
  UpdatePumpPayload,
  UpdateReservoirPayload,
} from '../models/equipment.model';

/** HTTP layer for a station's prices, pumps and reservoirs. Auth header comes from authInterceptor. */
@Injectable({ providedIn: 'root' })
export class StationEquipmentService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getPrices(stationId: string): Observable<ProductPrice[]> {
    return this.http.get<ProductPrice[]>(`${this.api}/stations/${stationId}/prices`);
  }

  setPrice(stationId: string, product: Product, pricePerLitre: number): Observable<ProductPrice> {
    return this.http.put<ProductPrice>(`${this.api}/stations/${stationId}/prices/${product}`, { pricePerLitre });
  }

  getPumps(stationId: string): Observable<Pump[]> {
    return this.http.get<Pump[]>(`${this.api}/stations/${stationId}/pumps`);
  }

  createPump(stationId: string, payload: CreatePumpPayload): Observable<Pump> {
    return this.http.post<Pump>(`${this.api}/stations/${stationId}/pumps`, payload);
  }

  updatePump(id: string, payload: UpdatePumpPayload): Observable<Pump> {
    return this.http.patch<Pump>(`${this.api}/pumps/${id}`, payload);
  }

  /** Admin only. The pump's past readings are kept server-side. */
  deletePump(id: string): Observable<Pump> {
    return this.http.delete<Pump>(`${this.api}/pumps/${id}`);
  }

  getReservoirs(stationId: string): Observable<Reservoir[]> {
    return this.http.get<Reservoir[]>(`${this.api}/stations/${stationId}/reservoirs`);
  }

  createReservoir(stationId: string, payload: CreateReservoirPayload): Observable<Reservoir> {
    return this.http.post<Reservoir>(`${this.api}/stations/${stationId}/reservoirs`, payload);
  }

  updateReservoir(id: string, payload: UpdateReservoirPayload): Observable<Reservoir> {
    return this.http.patch<Reservoir>(`${this.api}/reservoirs/${id}`, payload);
  }
}
