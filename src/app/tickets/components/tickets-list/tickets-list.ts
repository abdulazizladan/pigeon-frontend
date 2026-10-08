import { Component, inject, OnInit } from '@angular/core';
import { TicketsStore, StatusFilter } from '../../store/tickets.store';
import { AuthStore } from '../../../auth/store/auth.store';
import {
  Ticket,
  TicketStatus,
  TICKET_STATUSES,
  ticketStatusLabel,
} from '../../models/ticket.model';

@Component({
  selector: 'app-tickets-list',
  standalone: false,
  templateUrl: './tickets-list.html',
  styleUrl: './tickets-list.css',
})
export class TicketsListComponent implements OnInit {
  protected readonly store = inject(TicketsStore);
  protected readonly auth = inject(AuthStore);

  protected readonly statuses = TICKET_STATUSES;
  protected readonly filters: StatusFilter[] = ['all', ...TICKET_STATUSES];
  protected readonly canUpdate = this.auth.canManageUsers;

  ngOnInit() {
    this.store.loadTickets();
  }

  protected onSearch(event: Event) {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }

  protected setFilter(filter: StatusFilter) {
    this.store.setStatusFilter(filter);
  }

  protected openAddTicket() {
    this.store.openAddTicketModal();
  }

  protected onStatusChange(ticket: Ticket, event: Event) {
    const status = (event.target as HTMLSelectElement).value as TicketStatus;
    if (status !== ticket.status) {
      this.store.updateTicket({ id: ticket.id, changes: { status } });
    }
  }

  protected filterLabel(filter: StatusFilter): string {
    return filter === 'all' ? 'All' : ticketStatusLabel(filter);
  }

  protected filterCount(filter: StatusFilter): number {
    return filter === 'all' ? this.store.totalCount() : this.store.statusCounts()[filter];
  }

  protected statusLabel(status: TicketStatus): string {
    return ticketStatusLabel(status);
  }

  protected trackById(_: number, ticket: Ticket): string {
    return ticket.id;
  }
}
