import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTicketPayload, Ticket, TicketStats, UpdateTicketPayload } from '../models/ticket.model';

/** HTTP layer for /tickets. The Authorization header is attached by authInterceptor. */
@Injectable({ providedIn: 'root' })
export class TicketsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tickets`;

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  getStats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.baseUrl}/stats`);
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  createTicket(payload: CreateTicketPayload): Observable<Ticket> {
    return this.http.post<Ticket>(this.baseUrl, payload);
  }

  updateTicket(id: string, payload: UpdateTicketPayload): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${id}`, payload);
  }
}
