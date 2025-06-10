import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { TicketsService } from "../services/tickets.service";
import { Ticket } from "../models/ticket.model";

class TicketState {
  "tickets": Ticket[];
  "selectedTicket": Ticket | null;
  "loading": boolean;
  "error": string | null;
}

const intialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: ""
}

export const TicketsStore = signalStore(
  {providedIn: 'root'},
  withState(intialState),
  withMethods((store, ticketsService = inject(TicketsService)) => ({
    async loadTickets() {
      patchState(store, {loading: true, error: null});
      try {
        const tickets = await ticketsService.getTickets();
        patchState(store, {tickets, loading: false, error: null});
      } catch (error) {
        console.error('Error loading tickets: ', error);
        patchState(store, {
          error: 'Failed to load tickets. Please try again.',
          loading: false
        });
      }
    },
    async selectTicket(id: number) {
      patchState(store, {loading: true, error: null});
      try {
        const ticket = await ticketsService.getById(id);
        patchState(store, {selectedTicket: ticket, loading: false});
      } catch (error) {
        console.error('Error selecting ticket: ', error);
        patchState(store, {
          error: 'Failed to load ticket. Please try again.',
          loading: false
        });
      }
    },
    async addTicket(ticket: {title: string, description: string, status: 'active'}) {

    },
    updateTicket() {

    }
  })),

)

