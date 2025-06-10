import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Ticket } from '../models/ticket.model';
import { firstValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  constructor() { }

  getTickets(): Promise<Ticket[]> {
    return firstValueFrom(
      this.http.get<{success: boolean, message: string, data: Ticket[]}>(`${this.baseUrl}/ticket`).pipe(
        map(response => response.data)
      )
    )
  }

  getById(id: number): Promise<Ticket> {
    return firstValueFrom(
      this.http.get<{success: boolean, message: string, data: Ticket}>(`${this.baseUrl}/ticket/${id}`).pipe(
        map(response => response.data)
      )
    )
  }

  addComment(ticketId: number, comment: string): Promise<Ticket> {
    return firstValueFrom(
      this.http.post<{success: boolean, message: string, data: Ticket}>(`${this.baseUrl}/ticket/${ticketId}/reply`, { comment }).pipe(
        map(response => response.data)
      )
    )
  }
  addTicket(ticket: Ticket): Promise<Ticket> {
    return firstValueFrom(
      this.http.post<{success: boolean, message: string, data: Ticket}>(`${this.baseUrl}/ticket`, ticket).pipe(
        map(response => response.data)
      )
    )
  }
}
