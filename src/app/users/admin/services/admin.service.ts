import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { usersSummary } from '../models/users-summary.model';
import { firstValueFrom, map, Observable } from 'rxjs';
import { TicketsSummary } from '../models/tickets-summary.model';
import { environment } from '../../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly baseUrl = environment.baseUrl;

  constructor() { }

  private readonly http = inject(HttpClient)

  async getUserSummary(): Promise<usersSummary> {
    return firstValueFrom(
      this.http.get<usersSummary>(`${this.baseUrl}/user/stats`).pipe(

      )
    )
  }

  async getTicketsSummary(): Promise<TicketsSummary> {
    return firstValueFrom(
      this.http.get<TicketsSummary>(`${this.baseUrl}/ticket/stats`).pipe(
      )
    )
  }

  async getAttendantsSummary(): Promise<{ total: number, active: number, suspended: number }> {
    return firstValueFrom(
      this.http.get<{ total: number, active: number, suspended: number }>(`${this.baseUrl}/dispenser/stats`).pipe(
      )
    )
  }

  async getStationsSummary(): Promise<{ total: number, active: number, inactive: number }> {
    return firstValueFrom(
      this.http.get<{ total: number, active: number, inactive: number }>(`${this.baseUrl}/station/stats`).pipe(

      )
    )
  }

  getProfile(email: string): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${this.baseUrl}/user/${email}`).pipe(
      )
    )
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
      )
    )
  }
}
