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
      this.http.get<{success: boolean, data: usersSummary, messsage: string}>(`${this.baseUrl}/user/stats`).pipe(
        map(response => response.data)
      )
    )
  }

  async getTicketsSummary(): Promise<TicketsSummary> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: TicketsSummary, messsage: string}>(`${this.baseUrl}/ticket/stats`).pipe(
        map(response => response.data)
      )
    )
  }

  async getAttendantsSummary(): Promise<{total: number, active: number, suspended: number}> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: {total: number, active: number, suspended: number}, messsage: string}>(`${this.baseUrl}/dispenser/stats`).pipe(
        map(response => response.data)
      )
    )
  }

  async getStationsSummary(): Promise<{total: number, active: number, inactive: number}> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: {total: number, active: number, inactive: number}, messsage: string}>(`${this.baseUrl}/station/stats`).pipe(
        map(response => response.data)
      )
    )
  }

  getProfile(email: string): Promise<User> {
    return firstValueFrom(
      this.http.get<{success: boolean, data: User, message: string}>(`${this.baseUrl}/user/${email}`).pipe(
        map(response => response.data)
      )
    )
  }

  changePassword(newPassword: string): Promise<{success: boolean, message: string, data: {access_token: string}}> {
    // FIX: Wrap the password string in a JSON object with the expected key (e.g., 'newPassword')
    const body = { 
      newPassword: newPassword 
    };
    
    return firstValueFrom(
      this.http.patch<{success: boolean, message: string, data: {access_token: string}}>(
        `${this.baseUrl}/auth/change-password`, 
        body // 👈 Send the JSON object
      ).pipe(
        
      )
    )
  }
}
