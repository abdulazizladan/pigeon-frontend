import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TotalSale {
    totalSale: number;
}

export interface WeeklySale {
    week: number;
    totalSale: number;
}

export interface MonthlySale {
    month: string;
    totalSale: number;
}

export interface DailyStationReport {
    stationId: string;
    stationName: string;
    totalSale: number;
    date: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private apiUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getTotalRevenue(): Observable<TotalSale> {
        return this.http.get<TotalSale>(`${this.apiUrl}/sales/report/total`);
    }

    getWeeklySales(): Observable<WeeklySale[]> {
        return this.http.get<WeeklySale[]>(`${this.apiUrl}/sales/report/weekly`);
    }

    getMonthlySales(): Observable<MonthlySale[]> {
        return this.http.get<MonthlySale[]>(`${this.apiUrl}/sales/report/monthly`);
    }

    getDailyStationReports(): Observable<DailyStationReport[]> {
        return this.http.get<DailyStationReport[]>(`${this.apiUrl}/station/report/daily`);
    }
}
