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
  loadStationSales(stationId: number): Promise<Sale[]>{
    return firstValueFrom(
      this.http.get<{success: Boolean, data: Sale[], error: string}>(`${this.baseUrl}/${stationId}`).pipe(
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
      this.http.post<{success: Boolean, data: any, error: string}>(`${this.baseUrl}`, sale).pipe(
      )
    )
  }

  constructor() { }
}
