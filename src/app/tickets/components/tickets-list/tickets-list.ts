import { Component, computed, inject, OnInit } from '@angular/core';
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
  /** Admins triage every ticket; everyone else sees and manages only the tickets they raised. */
  protected readonly isAdmin = computed(() => this.auth.role() === 'admin');
  protected readonly pageTitle = computed(() => (this.isAdmin() ? 'Support Tickets' : 'My Support Tickets'));
  protected readonly pageHint = computed(() =>
    this.isAdmin() ? 'Every ticket raised across the network' : 'Tickets you raised, and where each one stands',
  );

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

  protected isOwner(ticket: Ticket): boolean {
    return ticket.createdById === this.auth.user()?.id;
  }

  protected canEdit(ticket: Ticket): boolean {
    return this.isAdmin() || (this.isOwner(ticket) && ticket.status !== 'closed');
  }

  protected edit(ticket: Ticket) {
    this.store.openEditTicketModal(ticket);
  }

  /** Owners can close a ticket they no longer need, or reopen one they closed. */
  protected closeTicket(ticket: Ticket) {
    this.store.updateTicket({ id: ticket.id, changes: { status: 'closed' } });
  }

  protected reopenTicket(ticket: Ticket) {
    this.store.updateTicket({ id: ticket.id, changes: { status: 'open' } });
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
