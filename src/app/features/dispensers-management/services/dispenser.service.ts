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
      this.http.get<Dispenser[]>(`${this.baseUrl}/dispenser`).pipe(
      )
    )
  }

  async create(dispenser: Dispenser): Promise<Dispenser> {
    return firstValueFrom(
      this.http.post<Dispenser>(`${this.baseUrl}/dispenser`, dispenser).pipe(
      )
    );
  }

  async getById(id: string): Promise<Dispenser> {
    return firstValueFrom(
      this.http.get<Dispenser>(`${this.baseUrl}/dispenser/${id}`).pipe(
      )
    )
  }

  async update(id: string) {

  }
}
