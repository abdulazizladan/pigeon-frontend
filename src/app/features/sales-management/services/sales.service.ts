import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Sale } from '../models/sale.model';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, map } from 'rxjs';

class CreateStationDTO {
  "product": string;
  "pricePerLitre": number;
  "openingMeterReading": number;
  "closingMeterReading": number;
  "pumpId": string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getSummary() {

  }

  /**
   * 
   * @param stationId 
   * @returns 
   */
  loadStationSales(stationId: number): Promise<Sale[]> {
    return firstValueFrom(
      this.http.get<{ success: Boolean, data: Sale[], error: string }>(`${this.baseUrl}/${stationId}`).pipe(
        map(result => result.data)
      )
    )
  }

  /**
   * 
   * @param sale 
   * @returns 
   */
  addSale(sale: CreateStationDTO) {
    return firstValueFrom(
      this.http.post<{ success: Boolean, data: any, error: string }>(`${this.baseUrl}`, sale).pipe(
      )
    )
  }

  /**
   * Fetches the total sales revenue across all stations.
   * Endpoint: GET /sales/report/total
   */
  async getTotalSales(): Promise<{ totalSale: number }> {
    return firstValueFrom(
      this.http.get<{ totalSale: number }>(`${this.baseUrl}/sales/report/total`)
    );
  }

  /**
   * Fetches weekly sales trends.
   * Endpoint: GET /sales/report/weekly
   */
  async getWeeklySales(): Promise<{ week: number, totalSale: number }[]> {
    return firstValueFrom(
      this.http.get<{ week: number, totalSale: number }[]>(`${this.baseUrl}/sales/report/weekly`)
    );
  }

  /**
   * Fetches monthly sales trends.
   * Endpoint: GET /sales/report/monthly
   */
  async getMonthlySales(): Promise<{ month: string, totalSale: number }[]> {
    return firstValueFrom(
      this.http.get<{ month: string, totalSale: number }[]>(`${this.baseUrl}/sales/report/monthly`)
    );
  }

  /**
   * Fetches detailed daily sales for a specific station.
   * Endpoint: GET /sales/report/daily/station/:stationId
   */
  async getDailyStationSales(stationId: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/sales/report/daily/station/${stationId}`)
    );
  }

  constructor() { }
}
