import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime } from 'rxjs';
import { MaintenanceService } from '../services/maintenance.service';
import {
  CreateHealthCheckPayload,
  HealthCheckReport,
  HealthCheckTemplate,
  HealthChecksQuery,
} from '../models/maintenance.model';
import { formatLocalDate, rangeForPreset } from '../../sales/models/sales.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ChecksPreset = '7d' | '30d' | '90d';

export interface HealthChecksState {
  /** null = the signed-in manager's own station. */
  stationId: string | null;
  preset: ChecksPreset;
  checks: HealthCheckReport[];
  loadingState: LoadingState;
  errorMessage: string | null;
  expandedId: string | null;
  // record / edit modal
  isCheckModalOpen: boolean;
  modalStationId: string | null;
  editingCheck: HealthCheckReport | null;
  template: HealthCheckTemplate | null;
  templateLoadingState: LoadingState;
  templateErrorMessage: string | null;
  saveLoadingState: LoadingState;
  saveErrors: string[];
}

const initialState: HealthChecksState = {
  stationId: null,
  preset: '30d',
  checks: [],
  loadingState: 'idle',
  errorMessage: null,
  expandedId: null,
  isCheckModalOpen: false,
  modalStationId: null,
  editingCheck: null,
  template: null,
  templateLoadingState: 'idle',
  templateErrorMessage: null,
  saveLoadingState: 'idle',
  saveErrors: [],
};

function apiErrors(err: any, fallback: string): string[] {
  const m = err?.error?.message;
  if (Array.isArray(m) && m.length) return m.map(String);
  if (typeof m === 'string' && m) return [m];
  return [fallback];
}

export const HealthChecksStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ stationId, preset, checks, loadingState, saveLoadingState, templateLoadingState }) => {
    const range = computed(() => rangeForPreset(preset()));
    return {
      range,
      query: computed<HealthChecksQuery>(() => ({ stationId: stationId(), ...range() })),
      isLoading: computed(() => loadingState() === 'loading'),
      isSaving: computed(() => saveLoadingState() === 'loading'),
      isTemplateLoading: computed(() => templateLoadingState() === 'loading'),
      /** Newest check in the loaded range; the list is ordered newest first. */
      latest: computed(() => checks()[0] ?? null),
      todayCheck: computed(() => {
        const today = formatLocalDate(new Date());
        return checks().find((c) => c.recordedOn === today) ?? null;
      }),
    };
  }),
  withMethods((store, service = inject(MaintenanceService)) => {
    const methods = {
      setStation(stationId: string | null) {
        if (store.stationId() !== stationId) patchState(store, { stationId, checks: [], expandedId: null, loadingState: 'idle' });
      },
      setPreset(preset: ChecksPreset) {
        patchState(store, { preset });
      },
      toggleExpanded(id: string) {
        patchState(store, (s) => ({ expandedId: s.expandedId === id ? null : id }));
      },

      loadChecks: rxMethod<HealthChecksQuery>(
        pipe(
          debounceTime(80),
          tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
          switchMap((query) =>
            service.getHealthChecks(query).pipe(
              tap((checks) => patchState(store, { checks, loadingState: 'success' })),
              catchError((err) => {
                patchState(store, { loadingState: 'error', errorMessage: apiErrors(err, 'Could not load health checks.').join(' ') });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      loadTemplate: rxMethod<string | null>(
        pipe(
          tap(() => patchState(store, { templateLoadingState: 'loading', templateErrorMessage: null, template: null })),
          switchMap((stationId) =>
            service.getHealthCheckTemplate(stationId).pipe(
              tap((template) => patchState(store, { template, templateLoadingState: 'success' })),
              catchError((err) => {
                patchState(store, { templateLoadingState: 'error', templateErrorMessage: apiErrors(err, 'Could not prepare the check.').join(' ') });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      openCheckModal(options: { stationId?: string | null; check?: HealthCheckReport | null } = {}) {
        const check = options.check ?? null;
        const modalStationId = check ? check.stationId : options.stationId ?? store.stationId();
        patchState(store, { isCheckModalOpen: true, modalStationId, editingCheck: check, saveLoadingState: 'idle', saveErrors: [] });
        methods.loadTemplate(modalStationId);
      },

      closeCheckModal() {
        patchState(store, { isCheckModalOpen: false, editingCheck: null, template: null, templateLoadingState: 'idle', saveLoadingState: 'idle', saveErrors: [] });
      },

      saveCheck: rxMethod<{ checkId: string | null; payload: CreateHealthCheckPayload }>(
        pipe(
          tap(() => patchState(store, { saveLoadingState: 'loading', saveErrors: [] })),
          switchMap(({ checkId, payload }) => {
            const request$ = checkId
              ? service.updateHealthCheck(checkId, { stationCondition: payload.stationCondition, notes: payload.notes, pumps: payload.pumps })
              : service.createHealthCheck(payload);
            return request$.pipe(
              tap((report) =>
                patchState(store, (s) => ({
                  checks: [report, ...s.checks.filter((c) => c.id !== report.id)].sort((a, b) => b.recordedOn.localeCompare(a.recordedOn)),
                  expandedId: report.id,
                  saveLoadingState: 'success' as LoadingState,
                  isCheckModalOpen: false,
                  editingCheck: null,
                  template: null,
                })),
              ),
              catchError((err) => {
                patchState(store, { saveLoadingState: 'error', saveErrors: apiErrors(err, 'Could not save the health check.') });
                return EMPTY;
              }),
            );
          }),
        ),
      ),
    };
    return methods;
  }),
);
