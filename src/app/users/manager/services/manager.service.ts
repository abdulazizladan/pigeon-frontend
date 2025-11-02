import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { firstValueFrom, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Station } from '../../../features/station-management/models/station.model';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  constructor() { }

  getProfile(email: string): Promise<User> {
      return firstValueFrom(
        this.http.get<{success: boolean, data: User, message: string}>(`${this.baseUrl}/user/${email}`).pipe(
          map(response => response.data)
        )
      )
    }

  /**
   * Fetches the station assigned to the current manager
   * @returns Promise<Station>
   */
  async getMyStation(): Promise<Station> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: Station, message: string}>(`${this.baseUrl}/station/me`).pipe(
        map(response => response.data)
      )
    );
  }
}
