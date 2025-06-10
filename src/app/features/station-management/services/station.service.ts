import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Station } from '../models/station.model';

@Injectable({
  providedIn: 'root'
})
export class StationService {

  private readonly baseUrl = environment;
  private readonly http = inject(HttpClient);

  id: number = 1;

  public get(): Promise<Station> {
    return firstValueFrom(this.http.get<{succes: boolean, data: Station, message: string}>(`${this.baseUrl}/station/${this.id}`).pipe(
      map(response => response.data)
    ))
  }

  constructor() { }
}
