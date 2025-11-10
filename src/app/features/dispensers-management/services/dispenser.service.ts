import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Dispenser } from '../models/dispenser.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DispenserService {

  private baseUrl = environment.baseUrl;

  constructor() { }

  private readonly http = inject(HttpClient);

  async get(): Promise<Dispenser[]> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: Dispenser[], message: string}>(`${this.baseUrl}/dispenser`).pipe(
        map(response => response.data)
      )
    )
  }

  async create(dispenser: Dispenser): Promise<Dispenser> {
    return firstValueFrom(
      this.http.post<{success: boolean, data: Dispenser, message: string}>(`${this.baseUrl}/dispenser`, dispenser).pipe(
        map(response => response.data)
      )
    );
  }

  async update(id: string) {
    
  }
}
