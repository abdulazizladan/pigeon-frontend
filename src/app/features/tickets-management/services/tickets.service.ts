import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Ticket } from '../models/ticket.model';
import { firstValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../../../auth/store/auth.store';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  private readonly authStore = inject(AuthStore);

  constructor() { }

  getTickets(): Promise<Ticket[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/ticket`).pipe(
        map(tickets => tickets.map(t => ({ ...t, id: t.id || t._id })))
      )
    )
  }

  getById(id: string): Promise<Ticket> {
    return firstValueFrom(
      this.http.get<any>(`${this.baseUrl}/ticket/${id}`).pipe(
        map(t => ({ ...t, id: t.id || t._id }))
      )
    )
  }

  async addReply(ticketId: string, message: string, status?: string): Promise<Ticket> {
    // Validation: Cannot reply to resolved tickets unless admin
    const ticket = await this.getById(ticketId);
    if (ticket.status === 'resolved' && this.authStore.userRole() !== 'admin') {
      throw new Error('Cannot reply to a resolved ticket');
    }

    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/ticket/${ticketId}/reply`, { message, status }).pipe(
        map(t => ({ ...t, id: t.id || t._id }))
      )
    )
  }

  addTicket(ticket: any): Promise<Ticket> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/ticket`, ticket).pipe(
        map(t => ({ ...t, id: t.id || t._id }))
      )
    )
  }

  getTicketsByEmail(email: string): Promise<Ticket[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/ticket/email/${email}`).pipe(
        map(tickets => tickets.map(t => ({ ...t, id: t.id || t._id })))
      )
    )
  }

  updateTicket(id: string, dto: { title?: string, description?: string, status?: string }): Promise<Ticket> {
    return firstValueFrom(
      this.http.patch<any>(`${this.baseUrl}/ticket/${id}`, dto).pipe(
        map(t => ({ ...t, id: t.id || t._id }))
      )
    )
  }

  deleteTicket(id: string): Promise<{ success: boolean, message: string }> {
    return firstValueFrom(
      this.http.delete<{ success: boolean, message: string }>(`${this.baseUrl}/ticket/${id}`)
    )
  }

  getStats(): Promise<{ total: number; active: number; resolved: number; dismissed: number; }> {
    return firstValueFrom(
      this.http.get<{ total: number; active: number; resolved: number; dismissed: number; }>(`${this.baseUrl}/ticket/stats`)
    )
  }
}
