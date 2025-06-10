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

  getSummary() {

  }

  loadStationSales(stationId: number): Promise<Sale[]>{
    return firstValueFrom(
      this.http.get<{success: Boolean, data: Sale[], error: string}>(`${this.baseUrl}`).pipe(
        map(result => result.data)
      )
    )
  }

  addSale(stationId: number, sale: Sale) {

  }

  constructor() { }
}
