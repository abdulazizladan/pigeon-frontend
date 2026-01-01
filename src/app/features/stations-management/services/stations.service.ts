import { inject, Injectable, OnInit } from '@angular/core';
import { Station } from '../models/station.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Manager } from '../../managers-management/models/manager.model';

@Injectable({
  providedIn: 'root'
})
export class StationsService implements OnInit {

  // Updated status method
  async updateStationStatus(id: string, status: 'active' | 'suspended'): Promise<Station> {
    const body = { status };
    return firstValueFrom(
      this.http.patch<Station>(
        `${this.baseUrl}/station/${id}/status`,
        body
      )
    );
  }

  ngOnInit(): void { }

  private readonly http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  async createStation(station: Omit<Station, 'id'>): Promise<Station> {
    return firstValueFrom(
      this.http.post<{ success: boolean, data: Station, message: string }>(`${this.baseUrl}/station`, station).pipe(
        map(response => response.data)
      )
    )
  }

  async getAll(): Promise<Station[]> {
    return firstValueFrom(
      this.http.get<Station[]>(`${this.baseUrl}/station`).pipe(
      )
    );
  }

  async getById(id: string): Promise<Station> {
    return firstValueFrom(
      this.http.get<Station>(`${this.baseUrl}/station/${id}`).pipe(

      ));
  }

  async getManagers(): Promise<Manager[]> {
    return firstValueFrom(
      this.http.get<Manager[]>(`${this.baseUrl}/user/managers`).pipe(

      )
    )
  }

  // 🚀 New Method: Assigns a manager (User) to a station
  async assignManager(stationId: string, managerId: string): Promise<Station> {
    const body = { managerId };
    return firstValueFrom(
      this.http.post<{ success: boolean, data: Station, message: string }>(
        `${this.baseUrl}/station/${stationId}/manager/assign`,
        body
      ).pipe(
        map(response => response.data)
      )
    );
  }

  // 🚀 New Method: Unassigns the current manager from a station
  async unassignManager(stationId: string): Promise<Station> {
    return firstValueFrom(
      this.http.delete<{ success: boolean, data: Station, message: string }>(
        `${this.baseUrl}/station/${stationId}/manager/unassign`
      ).pipe(
        map(response => response.data)
      )
    );
  }

  // 🚀 New Method: Fetches daily sales grouped by Station and Day
  async getDailySalesAggregated(): Promise<{ stationName: string, date: string, totalVolumeSold: number, totalDailyRevenue: number }[]> {
    return firstValueFrom(
      this.http.get<{ success: boolean, data: any[], message: string }>(`${this.baseUrl}/station/report/daily`).pipe(
        map(response => response.data)
      )
    );
  }

  // 🚀 New Method: Fetches sales graph data for a specific station
  async getStationSalesGraph(stationId: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<{ success: boolean, data: any[], message: string }>(`${this.baseUrl}/station/${stationId}/sales-graph`).pipe(
        map(response => response.data)
      )
    );
  }

  // 🚀 New Method: Get the station assigned to the logged-in manager
  async getMine(): Promise<Station> {
    return firstValueFrom(
      this.http.get<Station>(`${this.baseUrl}/station/mine`)
    );
  }

  // 🚀 New Method: Get station statistics
  async getStats(): Promise<any> {
    return firstValueFrom(
      this.http.get<{ success: boolean, data: any, message: string }>(`${this.baseUrl}/station/stats`).pipe(
        map(response => response.data)
      )
    );
  }

  // 🚀 New Method: Get specific station summary stats
  async getSummary(id: string): Promise<any> {
    return firstValueFrom(
      this.http.get<{ success: boolean, data: any, message: string }>(`${this.baseUrl}/station/${id}/summary`).pipe(
        map(response => response.data)
      )
    );
  }

  // 🚀 New Method: Record/Update daily pump sales
  async recordDailySales(data: { pumpId: string, closingMeterReading: number, date: string }): Promise<void> {
    return firstValueFrom(
      this.http.post<{ success: boolean, message: string }>(`${this.baseUrl}/station/record`, data).pipe(
        map(response => undefined)
      )
    );
  }

}
