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
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
  };
  message: string;
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
        this.http.get<{success: boolean, data: User, message: string}>(`${this.baseUrl}/user/${email}`).pipe(
          map(response => response.data)
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
        if (response.success && response.data) {
          return response.data;
        }
        // If the API returns a non-success response, throw an error
        throw new Error(response.message || 'Failed to fetch station stats with status OK.');
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

  getSalesRecords(period: string): Observable<SalesDataPoint[]> {
    // In a real application, you would pass 'period' as a query parameter:
    // const salesUrl = `${this.apiUrl}/sales?period=${period}`;
    // return this.http.get<{ data: SalesDataPoint[] }>(salesUrl).pipe( ... );

    // --- SIMULATION LOGIC ---
    // Since we are in a canvas environment, we simulate the different API responses.
    
    let numDataPoints: number;
    let labelPrefix: string;

    switch (period) {
      case 'daily':
        numDataPoints = 30;
        labelPrefix = 'Day';
        break;
      case 'weekly':
        numDataPoints = 10;
        labelPrefix = 'Week';
        break;
      case 'monthly':
        numDataPoints = 12;
        labelPrefix = 'Month';
        break;
      default:
        numDataPoints = 0;
        labelPrefix = 'Data';
    }

    const mockData: SalesDataPoint[] = [];
    for (let i = 1; i <= numDataPoints; i++) {
      mockData.push({
        label: `${labelPrefix} ${i}`,
        // Generate mock sales data that trends slightly up
        petrolSales: 1000 + (i * 50) + Math.floor(Math.random() * 200),
        dieselSales: 800 + (i * 40) + Math.floor(Math.random() * 150),
      });
    }

    // Wrap the mock data in an Observable to match HttpClient return type
    return of(mockData).pipe(
        // Simulate a slight delay for better UX demonstration
        // delay(500),
        // No external API call, so no need to catchError here.
    );
    // --- END SIMULATION LOGIC ---
  }
}
