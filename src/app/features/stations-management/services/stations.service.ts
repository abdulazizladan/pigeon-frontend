import { inject, Injectable, OnInit } from '@angular/core';
import { Station } from '../models/station.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StationsService implements OnInit{

  ngOnInit(): void {}

  private readonly http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  async createStation(station: Omit<Station, 'id'>): Promise<Station> {
    return firstValueFrom(
      this.http.post<Station>(`${this.baseUrl}/station`, station)
    )
  }

  async get(): Promise<Station[]> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: Station[], message: string}>(`${this.baseUrl}/station`).pipe(
        map(response => response.data)
      )
    );
  }

  async getById(id: number): Promise<Station> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: Station, message: string}>(`${this.baseUrl}/station/${id}`).pipe(
      map(response => response.data)
    ));
  }

}
