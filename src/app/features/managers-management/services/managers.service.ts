import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Manager } from '../models/manager.moel';
import { filter, firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../users-management/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ManagersService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async getManagers(): Promise<User[]> {
    return firstValueFrom(
      this.http.get<User[]>(`${this.baseUrl}/user`).pipe(
        map(response => response),
        //filter(user => user.role === 'manager')
      )
    );
  }

  constructor() { }
}
