import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Station } from '../models/station.model';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  // --- Core Station Management ---

  async createStation(data: any): Promise<Station> {
    return firstValueFrom(this.http.post<Station>(`${this.baseUrl}/station`, data));
  }

  async getAllStations(): Promise<Station[]> {
    return firstValueFrom(this.http.get<Station[]>(`${this.baseUrl}/station`));
  }

  async getStationStats(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/station/stats`));
  }

  async getStationById(id: string): Promise<Station> {
    return firstValueFrom(this.http.get<Station>(`${this.baseUrl}/station/${id}`));
  }

  async updateStation(id: string, data: any): Promise<Station> {
    return firstValueFrom(this.http.patch<Station>(`${this.baseUrl}/station/${id}`, data));
  }

  async deleteStation(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/station/${id}`));
  }

  // --- Station Summary & Reporting ---

  async getStationSummary(id: string): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/station/${id}/summary`));
  }

  async getDailyReport(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/station/report/daily`));
  }

  // --- Manager Assignment ---

  async assignManager(stationId: string, managerId: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.baseUrl}/station/${stationId}/manager/assign`, { managerId }));
  }

  async unassignManager(stationId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/station/${stationId}/manager/unassign`));
  }

  // --- Operational Records ---

  async recordDailySales(data: { pumpId: string, recordDate: string, volumeSold: number, totalRevenue: number }): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.baseUrl}/station/record`, data));
  }
}
