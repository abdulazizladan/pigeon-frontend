import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupplyService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.baseUrl;

    // --- Supply Requests ---

    async requestRestock(data: { stationId: string, product: 'Petrol' | 'Diesel', quantity: number }): Promise<any> {
        return firstValueFrom(this.http.post<any>(`${this.baseUrl}/supply/request`, data));
    }

    async getAllRequests(): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/supply`));
    }

    async getStationRequests(stationId: string): Promise<any[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/supply/station/${stationId}`));
    }

    async updateRequestStatus(id: string, status: 'APPROVED' | 'DELIVERED' | 'REJECTED'): Promise<any> {
        return firstValueFrom(this.http.patch<any>(`${this.baseUrl}/supply/${id}/status`, { status }));
    }

    // --- Supply Trends (Charts) ---

    async getGlobalRestockTrends(): Promise<{ date: string, product: string, totalQuantity: number }[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/supply/stats/trends`));
    }

    async getStationRestockTrends(stationId: string): Promise<{ date: string, product: string, totalQuantity: number }[]> {
        return firstValueFrom(this.http.get<any[]>(`${this.baseUrl}/supply/station/${stationId}/stats/trends`));
    }
}
