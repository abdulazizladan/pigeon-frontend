import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Manager } from '../models/manager.model';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../users-management/models/user.model';



@Injectable({
  providedIn: 'root'
})
export class ManagersService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async getManagers(): Promise<Manager[]> {
    return firstValueFrom(
      this.http.get<Manager[]>(`${this.baseUrl}/user/managers`).pipe(
      )
    );
  }

  async getById(id: string): Promise<Manager> {
    return firstValueFrom(
      this.http.get<Manager>(`${this.baseUrl}/user/manager/${id}`).pipe(
      )
    )
  }

  async add(manager: Omit<User, 'id'>): Promise<User> {
    return firstValueFrom(
      this.http.post<User>(`${this.baseUrl}/user`, manager).pipe(
      )
    )
  }

  async assignStation(managerId: string, stationId: string): Promise<Manager> {
    const body = { managerId };
    return firstValueFrom(
      this.http.post<Manager>(`${this.baseUrl}/station/${stationId}/manager/assign`, body).pipe(
      )
    )
  }

  constructor() { }
}
