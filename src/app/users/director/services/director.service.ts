import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';


/**
 * Interface for a single data point in the sales line graph.
 */
export interface SalesDataPoint {
  label: string; // e.g., 'Day 1', 'Week 1', 'Jan'
  petrolSales: number; // Volume or Value
  dieselSales: number; // Volume or Value
}

/**
 * Defines the allowed periods for sales filtering.
 */
export type SalesPeriod = 'daily' | 'weekly' | 'monthly';



export interface StationStatsResponse {
  total: number;
  active: number;
  inactive: number;
}

export interface StationStats {
  total: number;
  active: number;
  inactive: number;
}

@Injectable({
  providedIn: 'root'
})
export class DirectorService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  constructor() { }

  getStations() {
    const url: string = `https://pigeon-backend-17s7.onrender.com/station`;
    return this.http.get(url)
  }

  getProfile(email: string): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${this.baseUrl}/user/${email}`).pipe(
      )
    )
  }

  /**
   * Fetches the overall fueling station statistics from the backend.
   *
   * @returns An Observable that emits the simplified StationStats object.
   */
  getStationStats(): Observable<StationStats> {
    // 1. Use HttpClient.get with the specific response type
    return this.http.get<StationStatsResponse>(`${this.baseUrl}/station/stats`).pipe(

      // 2. Map the full API response object to the simplified domain model (StationStats)
      map(response => {
        if (response) {
          return response
        }
        // If the API returns a non-success response, throw an error
        throw new Error('Failed to fetch station stats with status OK.');
      }),

      // 3. Handle potential HTTP errors (e.g., 404, 500, network issues)
      catchError(error => {
        console.error('Error fetching station statistics:', error);

        // Return a default safe/empty object to prevent the application from crashing
        // This is crucial for keeping the dashboard functional even with API issues.
        return of({ total: 0, active: 0, inactive: 0 } as StationStats);
      })
    );
  }

  async getSalesRecords(period: string): Promise<SalesDataPoint[]> {
    let salesData: SalesDataPoint[] = [];

    if (period === 'weekly') {
      const response = await firstValueFrom(
        this.http.get<{ week: number, totalSale: number }[]>(`${this.baseUrl}/sales/report/weekly`)
      );
      salesData = response.map(item => ({
        label: `Week ${item.week}`,
        petrolSales: item.totalSale, // Using petrolSales as 'Total' for now
        dieselSales: 0
      }));
    } else if (period === 'monthly') {
      const response = await firstValueFrom(
        this.http.get<{ month: string, totalSale: number }[]>(`${this.baseUrl}/sales/report/monthly`)
      );
      salesData = response.map(item => ({
        label: item.month, // "YYYY-MM"
        petrolSales: item.totalSale,
        dieselSales: 0
      }));
    } else {
      // 'daily' - Fetch aggregated daily report and group by date
      try {
        const response = await firstValueFrom(
          this.http.get<{ success: boolean, data: any[], message: string }>(`${this.baseUrl}/station/report/daily`)
        );

        if (response.success && response.data) {
          // Aggregate by date
          const dateMap = new Map<string, number>();

          response.data.forEach(item => {
            const date = item.date; // "YYYY-MM-DD"
            const currentTotal = dateMap.get(date) || 0;
            dateMap.set(date, currentTotal + (item.totalDailyRevenue || 0));
          });

          // Convert to array and sort by date
          salesData = Array.from(dateMap.entries())
            .map(([date, total]) => ({
              label: date,
              petrolSales: total,
              dieselSales: 0
            }))
            .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

          // Limit to last 30 days if needed? 
          // The backend endpoint might return all history, dealing with it for now.
        }
      } catch (e) {
        console.error("Failed to fetch daily report", e);
        salesData = [];
      }
    }

    return salesData;
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
