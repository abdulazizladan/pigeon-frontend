import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, mergeMap } from 'rxjs';
import { TicketsService } from '../services/tickets.service';
import {
  CreateTicketPayload,
  Ticket,
  TicketPriority,
  TicketStatus,
  UpdateTicketPayload,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from '../models/ticket.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type StatusFilter = TicketStatus | 'all';

export interface TicketsState {
  tickets: Ticket[];
  searchQuery: string;
  statusFilter: StatusFilter;
  loadingState: LoadingState;
  errorMessage: string | null;
  createLoadingState: LoadingState;
  createErrorMessage: string | null;
  isAddTicketModalOpen: boolean;
  updatingTicketIds: string[];
  updateErrorMessage: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  searchQuery: '',
  statusFilter: 'all',
  loadingState: 'idle',
  errorMessage: null,
  createLoadingState: 'idle',
  createErrorMessage: null,
  isAddTicketModalOpen: false,
  updatingTicketIds: [],
  updateErrorMessage: null,
};

function apiErrorMessage(err: any, fallback: string): string {
  const m = err?.error?.message;
  if (Array.isArray(m)) return m.join(' ');
  if (typeof m === 'string' && m) return m;
  return fallback;
}

export const TicketsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tickets, searchQuery, statusFilter }) => ({
    filteredTickets: computed(() => {
      const q = searchQuery().toLowerCase().trim();
      const status = statusFilter();
      return tickets().filter((t) => {
        if (status !== 'all' && t.status !== status) return false;
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.createdByUsername ?? '').toLowerCase().includes(q) ||
          (t.assignedToUsername ?? '').toLowerCase().includes(q) ||
          t.priority.includes(q)
        );
      });
    }),
    totalCount: computed(() => tickets().length),
    statusCounts: computed(() => {
      const counts = Object.fromEntries(TICKET_STATUSES.map((s) => [s, 0])) as Record<TicketStatus, number>;
      for (const t of tickets()) counts[t.status]++;
      return counts;
    }),
    priorityCounts: computed(() => {
      const counts = Object.fromEntries(TICKET_PRIORITIES.map((p) => [p, 0])) as Record<TicketPriority, number>;
      for (const t of tickets()) counts[t.priority]++;
      return counts;
    }),
    activeCount: computed(
      () => tickets().filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    ),
  })),
  withMethods((store, service = inject(TicketsService)) => ({
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },

    setStatusFilter(statusFilter: StatusFilter) {
      patchState(store, { statusFilter });
    },

    openAddTicketModal() {
      patchState(store, { isAddTicketModalOpen: true, createErrorMessage: null, createLoadingState: 'idle' });
    },

    closeAddTicketModal() {
      patchState(store, { isAddTicketModalOpen: false, createErrorMessage: null, createLoadingState: 'idle' });
    },

    resetCreateState() {
      patchState(store, { createLoadingState: 'idle', createErrorMessage: null });
    },

    clearUpdateError() {
      patchState(store, { updateErrorMessage: null });
    },

    isUpdating(id: string): boolean {
      return store.updatingTicketIds().includes(id);
    },

    loadTickets: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap(() =>
          service.getTickets().pipe(
            tap((tickets) => patchState(store, { tickets, loadingState: 'success' })),
            catchError((err) => {
              patchState(store, {
                loadingState: 'error',
                errorMessage: apiErrorMessage(err, 'Failed to load tickets.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    createTicket: rxMethod<CreateTicketPayload>(
      pipe(
        tap(() => patchState(store, { createLoadingState: 'loading', createErrorMessage: null })),
        switchMap((payload) =>
          service.createTicket(payload).pipe(
            tap((ticket) =>
              patchState(store, (state) => ({
                tickets: [ticket, ...state.tickets],
                createLoadingState: 'success' as LoadingState,
                isAddTicketModalOpen: false,
              })),
            ),
            catchError((err) => {
              patchState(store, {
                createLoadingState: 'error',
                createErrorMessage: apiErrorMessage(err, 'Could not create the ticket. Please try again.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    updateTicket: rxMethod<{ id: string; changes: UpdateTicketPayload }>(
      pipe(
        tap(({ id }) =>
          patchState(store, (state) => ({
            updatingTicketIds: [...state.updatingTicketIds, id],
            updateErrorMessage: null,
          })),
        ),
        mergeMap(({ id, changes }) =>
          service.updateTicket(id, changes).pipe(
            tap((updated) =>
              patchState(store, (state) => ({
                tickets: state.tickets.map((t) => (t.id === updated.id ? updated : t)),
                updatingTicketIds: state.updatingTicketIds.filter((x) => x !== id),
              })),
            ),
            catchError((err) => {
              patchState(store, (state) => ({
                updatingTicketIds: state.updatingTicketIds.filter((x) => x !== id),
                updateErrorMessage: apiErrorMessage(
                  err,
                  err?.status === 403 ? 'You are not allowed to update tickets.' : 'Could not update the ticket.',
                ),
              }));
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
