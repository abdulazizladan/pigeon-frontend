import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Station } from '../models/station.model';

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /**
   * Fetches a station by its ID
   * @param id The station ID
   * @returns Promise<Station>
   */
  async getStationById(id: string): Promise<Station> {
    return firstValueFrom(
      this.http.get<Station>(`${this.baseUrl}/station/${id}`).pipe(
      )
    );
  }
}
