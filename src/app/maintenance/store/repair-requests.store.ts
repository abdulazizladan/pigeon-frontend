import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime } from 'rxjs';
import { MaintenanceService } from '../services/maintenance.service';
import {
  CreateRepairRequestPayload,
  DecideRepairRequestPayload,
  HealthCheckTemplate,
  RepairPriority,
  RepairReportPrefill,
  RepairRequest,
  RepairRequestStats,
  RepairRequestsQuery,
  RepairStatus,
} from '../models/maintenance.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface RepairRequestsState {
  /** null = manager's own station, or every station for directors and admins. */
  stationId: string | null;
  statusFilter: RepairStatus | 'all';
  priorityFilter: RepairPriority | 'all';
  requests: RepairRequest[];
  loadingState: LoadingState;
  errorMessage: string | null;
  stats: RepairRequestStats | null;
  // report-fault modal
  isReportModalOpen: boolean;
  reportPrefill: RepairReportPrefill | null;
  reportTemplate: HealthCheckTemplate | null; // station + pumps for the picker
  reportTemplateLoadingState: LoadingState;
  createLoadingState: LoadingState;
  createErrorMessage: string | null;
  // decision modal
  decidingRequest: RepairRequest | null;
  decideLoadingState: LoadingState;
  decideErrorMessage: string | null;
}

const initialState: RepairRequestsState = {
  stationId: null,
  statusFilter: 'all',
  priorityFilter: 'all',
  requests: [],
  loadingState: 'idle',
  errorMessage: null,
  stats: null,
  isReportModalOpen: false,
  reportPrefill: null,
  reportTemplate: null,
  reportTemplateLoadingState: 'idle',
  createLoadingState: 'idle',
  createErrorMessage: null,
  decidingRequest: null,
  decideLoadingState: 'idle',
  decideErrorMessage: null,
};

function apiErrorMessage(err: any, fallback: string): string {
  const m = err?.error?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' && m ? m : fallback;
}

export const RepairRequestsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ stationId, statusFilter, priorityFilter, requests, loadingState, stats }) => ({
    query: computed<RepairRequestsQuery>(() => ({
      stationId: stationId(),
      status: statusFilter() === 'all' ? null : (statusFilter() as RepairStatus),
      priority: priorityFilter() === 'all' ? null : (priorityFilter() as RepairPriority),
    })),
    isLoading: computed(() => loadingState() === 'loading'),
    pendingCount: computed(() => requests().filter((r) => r.status === 'pending').length),
    pendingTotal: computed(() => stats()?.byStatus.pending ?? 0),
    urgentPending: computed(() => stats()?.pendingByPriority.high ?? 0),
  })),
  withComputed(({ decidingRequest }) => ({
    isDecisionModalOpen: computed(() => decidingRequest() !== null),
  })),
  withMethods((store, service = inject(MaintenanceService)) => {
    const methods = {
      setStation(stationId: string | null) {
        if (store.stationId() !== stationId) patchState(store, { stationId, requests: [], stats: null, loadingState: 'idle' });
      },
      setStatusFilter(statusFilter: RepairStatus | 'all') {
        patchState(store, { statusFilter });
      },
      setPriorityFilter(priorityFilter: RepairPriority | 'all') {
        patchState(store, { priorityFilter });
      },

      loadRequests: rxMethod<RepairRequestsQuery>(
        pipe(
          debounceTime(80),
          tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
          switchMap((query) =>
            service.getRepairRequests(query).pipe(
              tap((requests) => patchState(store, { requests, loadingState: 'success' })),
              catchError((err) => {
                patchState(store, { loadingState: 'error', errorMessage: apiErrorMessage(err, 'Could not load repair requests.') });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      loadStats: rxMethod<string | null>(
        pipe(
          switchMap((stationId) =>
            service.getRepairStats(stationId).pipe(
              tap((stats) => patchState(store, { stats })),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),

      // ---- report a fault ----
      openReportModal(prefill: RepairReportPrefill) {
        patchState(store, { isReportModalOpen: true, reportPrefill: prefill, createErrorMessage: null, createLoadingState: 'idle', reportTemplate: null });
        methods.loadReportTemplate(prefill.stationId);
      },

      closeReportModal() {
        patchState(store, { isReportModalOpen: false, reportPrefill: null, reportTemplate: null, createErrorMessage: null, createLoadingState: 'idle' });
      },

      /** The health-check template doubles as "station + its pumps" for the pump picker. */
      loadReportTemplate: rxMethod<string | null>(
        pipe(
          tap(() => patchState(store, { reportTemplateLoadingState: 'loading' })),
          switchMap((stationId) =>
            service.getHealthCheckTemplate(stationId).pipe(
              tap((reportTemplate) => patchState(store, { reportTemplate, reportTemplateLoadingState: 'success' })),
              catchError((err) => {
                patchState(store, { reportTemplateLoadingState: 'error', createErrorMessage: apiErrorMessage(err, 'Could not load the station.') });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      createRequest: rxMethod<CreateRepairRequestPayload>(
        pipe(
          tap(() => patchState(store, { createLoadingState: 'loading', createErrorMessage: null })),
          switchMap((payload) =>
            service.createRepairRequest(payload).pipe(
              tap((request) =>
                patchState(store, (s) => ({
                  requests: [request, ...s.requests],
                  createLoadingState: 'success' as LoadingState,
                  isReportModalOpen: false,
                  reportPrefill: null,
                  reportTemplate: null,
                })),
              ),
              tap(() => methods.loadStats(store.stationId())),
              catchError((err) => {
                patchState(store, { createLoadingState: 'error', createErrorMessage: apiErrorMessage(err, 'Could not send the repair request.') });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // ---- director decision ----
      openDecisionModal(request: RepairRequest) {
        patchState(store, { decidingRequest: request, decideErrorMessage: null, decideLoadingState: 'idle' });
      },

      closeDecisionModal() {
        patchState(store, { decidingRequest: null, decideErrorMessage: null, decideLoadingState: 'idle' });
      },

      decide: rxMethod<{ id: string; payload: DecideRepairRequestPayload }>(
        pipe(
          tap(() => patchState(store, { decideLoadingState: 'loading', decideErrorMessage: null })),
          switchMap(({ id, payload }) =>
            service.decideRepairRequest(id, payload).pipe(
              tap((updated) =>
                patchState(store, (s) => ({
                  requests: s.requests.map((r) => (r.id === updated.id ? updated : r)),
                  decideLoadingState: 'success' as LoadingState,
                  decidingRequest: null,
                })),
              ),
              tap(() => methods.loadStats(store.stationId())),
              catchError((err) => {
                patchState(store, {
                  decideLoadingState: 'error',
                  decideErrorMessage: apiErrorMessage(err, err?.status === 403 ? 'Only a director or admin can decide.' : 'Could not record the decision.'),
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    };
    return methods;
  }),
);
