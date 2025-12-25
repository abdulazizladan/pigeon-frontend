import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { TicketsService } from "../services/tickets.service";
import { Ticket } from "../models/ticket.model";

class TicketState {
  "tickets": Ticket[];
  "selectedTicket": Ticket | null;
  "loading": boolean;
  "error": string | null;
  "stats": { total: number; active: number; resolved: number; dismissed: number; }
}

const intialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: "",
  stats: { total: 0, active: 0, resolved: 0, dismissed: 0 }
}

export const TicketsStore = signalStore(
  { providedIn: 'root' },
  withState(intialState),
  withMethods((store, ticketsService = inject(TicketsService)) => ({
    async loadTickets() {
      patchState(store, { loading: true, error: null });
      try {
        const tickets = await ticketsService.getTickets();
        patchState(store, { tickets, loading: false, error: null });
      } catch (error) {
        console.error('Error loading tickets: ', error);
        patchState(store, {
          error: 'Failed to load tickets. Please try again.',
          loading: false
        });
      }
    },
    async loadStats() {
      try {
        const stats = await ticketsService.getStats();
        patchState(store, { stats });
      } catch (error) {
        console.error('Error loading stats: ', error);
      }
    },
    async loadTicketsByEmail(email: string) {
      patchState(store, { loading: true, error: null });
      try {
        const tickets = await ticketsService.getTicketsByEmail(email);
        patchState(store, { tickets, loading: false, error: null });
      } catch (error) {
        console.error('Error loading tickets: ', error);
        patchState(store, {
          error: 'Failed to load tickets. Please try again.',
          loading: false
        });
      }
    },
    async selectTicket(id: string) {
      patchState(store, { loading: true, error: null });
      try {
        const ticket = await ticketsService.getById(id);
        patchState(store, { selectedTicket: ticket, loading: false });
      } catch (error) {
        console.error('Error selecting ticket: ', error);
        patchState(store, {
          error: 'Failed to load ticket. Please try again.',
          loading: false
        });
      }
    },
    async addTicket(ticket: any) {
      patchState(store, { loading: true, error: null });
      try {
        const newTicket = await ticketsService.addTicket(ticket);
        patchState(store, {
          tickets: [...store.tickets(), newTicket],
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Failed to add ticket. Please try again.',
          loading: false
        });
      }
    },
    async updateTicket(id: string, dto: { title?: string, description?: string, status?: string }) {
      patchState(store, { loading: true, error: null });
      try {
        const updatedTicket = await ticketsService.updateTicket(id, dto);
        patchState(store, {
          tickets: store.tickets().map(t => t.id === id ? updatedTicket : t),
          selectedTicket: store.selectedTicket()?.id === id ? updatedTicket : store.selectedTicket(),
          loading: false
        });
        // Reload stats if status changed
        if (dto.status) {
          const stats = await ticketsService.getStats();
          patchState(store, { stats });
        }
      } catch (error) {
        patchState(store, {
          error: 'Failed to update ticket. Please try again.',
          loading: false
        });
      }
    },
    async deleteTicket(id: string) {
      patchState(store, { loading: true, error: null });
      try {
        await ticketsService.deleteTicket(id);
        patchState(store, {
          tickets: store.tickets().filter(t => t.id !== id),
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Failed to delete ticket. Please try again.',
          loading: false
        });
      }
    },
    async addReply(ticketId: string, message: string) {
      patchState(store, { loading: true, error: null });
      try {
        await ticketsService.addReply(ticketId, message);
        const updatedTicket = await ticketsService.getById(ticketId);
        patchState(store, {
          selectedTicket: updatedTicket,
          tickets: store.tickets().map(t => t.id === ticketId ? updatedTicket : t),
          loading: false
        });
      } catch (error) {
        patchState(store, {
          error: 'Failed to add reply. Please try again.',
          loading: false
        });
      }
    }
  })),

)

