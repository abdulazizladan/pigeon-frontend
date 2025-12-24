import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Sale } from '../models/sale.model';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  // --- Core Sales Management ---

  async addSale(sale: CreateSaleDTO): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.baseUrl}/sales`, sale));
  }

  async getAllSales(page: number = 1, limit: number = 20): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.baseUrl}/sales?page=${page}&limit=${limit}`));
  }

  async getSaleById(id: string): Promise<Sale> {
    return firstValueFrom(this.http.get<Sale>(`${this.baseUrl}/sales/${id}`));
  }

  async updateSale(id: string, data: any): Promise<any> {
    return firstValueFrom(this.http.patch<any>(`${this.baseUrl}/sales/${id}`, data));
  }

  async deleteSale(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/sales/${id}`));
  }

  // --- Sales Reporting (Revenue) ---

  async getTotalRevenue(): Promise<{ totalSale: number }> {
    return firstValueFrom(this.http.get<{ totalSale: number }>(`${this.baseUrl}/sales/report/total`));
  }

  async getStationTotalRevenue(stationId: string): Promise<{ totalSale: number }> {
    return firstValueFrom(this.http.get<{ totalSale: number }>(`${this.baseUrl}/sales/report/station/${stationId}/total`));
  }

  async getWeeklySales(): Promise<{ week: number, totalSale: number }[]> {
    return firstValueFrom(this.http.get<{ week: number, totalSale: number }[]>(`${this.baseUrl}/sales/report/weekly`));
  }

  async getMonthlySales(): Promise<{ month: string, totalSale: number }[]> {
    return firstValueFrom(this.http.get<{ month: string, totalSale: number }[]>(`${this.baseUrl}/sales/report/monthly`));
  }

  async getDailyStationSales(stationId: string): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/sales/report/daily/station/${stationId}`));
  }

  // --- Sales Charts ---

  async getDailySalesHistory(): Promise<{ date: string, totalSales: number }[]> {
    return firstValueFrom(this.http.get<{ date: string, totalSales: number }[]>(`${this.baseUrl}/sales/report/daily/history`));
  }

  async getStationDailySalesHistory(stationId: string): Promise<{ date: string, totalSales: number }[]> {
    return firstValueFrom(this.http.get<{ date: string, totalSales: number }[]>(`${this.baseUrl}/sales/report/daily/station/${stationId}/history`));
  }
}

export interface CreateSaleDTO {
  product: string;
  pricePerLitre: number;
  openingMeterReading: number;
  closingMeterReading: number;
  pumpId: string;
}
