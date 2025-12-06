import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { firstValueFrom } from 'rxjs';
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
      this.http.get<User>(`${this.baseUrl}/user/${email}`).pipe(
      )
    )
  }

  /**
   * Fetches the station assigned to the current manager
   * @returns Promise<Station>
   */
  async getMyStation(stationId: string): Promise<Station> {
    return firstValueFrom(
      this.http.get<Station>(`${this.baseUrl}/station/${stationId}`).pipe(
      )
    );
  }

  changePassword(newPassword: string): Promise<{ success: boolean, message: string, data: { access_token: string } }> {
    // FIX: Wrap the password string in a JSON object with the expected key (e.g., 'newPassword')
    const body = {
      newPassword: newPassword
    };

    return firstValueFrom(
      this.http.patch<{ success: boolean, message: string, data: { access_token: string } }>(
        `${this.baseUrl}/auth/change-password`,
        body // 👈 Send the JSON object
      ).pipe(

      )
    )
  }
}
