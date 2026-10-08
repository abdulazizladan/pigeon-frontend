import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime } from 'rxjs';
import { DailySalesService } from '../services/daily-sales.service';
import {
  CreateDailyRecordPayload,
  DailyRecordTemplate,
  DailyRecordsQuery,
  DailySalesReport,
  Totals,
  round2,
} from '../models/daily-sales.model';
import { formatLocalDate, rangeForPreset } from '../models/sales.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type RecordsPreset = '7d' | '30d' | '90d';

export interface DailySalesState {
  /** null = the caller's own station (managers) or all stations (directors, admins). */
  stationId: string | null;
  preset: RecordsPreset;
  records: DailySalesReport[];
  loadingState: LoadingState;
  errorMessage: string | null;
  expandedRecordId: string | null;

  // Record / edit modal
  isRecordModalOpen: boolean;
  modalStationId: string | null;
  editingRecord: DailySalesReport | null;
  template: DailyRecordTemplate | null;
  templateLoadingState: LoadingState;
  templateErrorMessage: string | null;
  saveLoadingState: LoadingState;
  saveErrors: string[];
}

const initialState: DailySalesState = {
  stationId: null,
  preset: '30d',
  records: [],
  loadingState: 'idle',
  errorMessage: null,
  expandedRecordId: null,
  isRecordModalOpen: false,
  modalStationId: null,
  editingRecord: null,
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

const emptyTotals: Totals = {
  expectedLitres: 0, actualLitres: 0, varianceLitres: 0,
  expectedAmount: 0, actualAmount: 0, varianceAmount: 0,
};

export const DailySalesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ stationId, preset, records, loadingState, saveLoadingState, templateLoadingState }) => {
    const range = computed(() => rangeForPreset(preset()));
    return {
      range,
      query: computed<DailyRecordsQuery>(() => ({ stationId: stationId(), ...range() })),
      isLoading: computed(() => loadingState() === 'loading'),
      isSaving: computed(() => saveLoadingState() === 'loading'),
      isTemplateLoading: computed(() => templateLoadingState() === 'loading'),
      hasRecords: computed(() => records().length > 0),
      /** The record for today, when the list is pinned to one station. */
      todayRecord: computed(() => {
        const today = formatLocalDate(new Date());
        return records().find((r) => r.recordedOn === today) ?? null;
      }),
      /** Sum of every record in the loaded range. */
      rangeTotals: computed<Totals>(() =>
        records().reduce<Totals>(
          (t, r) => ({
            expectedLitres: round2(t.expectedLitres + r.totals.expectedLitres),
            actualLitres: round2(t.actualLitres + r.totals.actualLitres),
            varianceLitres: round2(t.varianceLitres + r.totals.varianceLitres),
            expectedAmount: round2(t.expectedAmount + r.totals.expectedAmount),
            actualAmount: round2(t.actualAmount + r.totals.actualAmount),
            varianceAmount: round2(t.varianceAmount + r.totals.varianceAmount),
          }),
          emptyTotals,
        ),
      ),
    };
  }),
  withMethods((store, service = inject(DailySalesService)) => {
    const methods = {
      setStation(stationId: string | null) {
        if (store.stationId() !== stationId) {
          patchState(store, { stationId, records: [], expandedRecordId: null, loadingState: 'idle' });
        }
      },

      setPreset(preset: RecordsPreset) {
        patchState(store, { preset });
      },

      toggleExpanded(recordId: string) {
        patchState(store, (s) => ({ expandedRecordId: s.expandedRecordId === recordId ? null : recordId }));
      },

      loadRecords: rxMethod<DailyRecordsQuery>(
        pipe(
          debounceTime(80),
          tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
          switchMap((query) =>
            service.getRecords(query).pipe(
              tap((records) => patchState(store, { records, loadingState: 'success' })),
              catchError((err) => {
                patchState(store, {
                  loadingState: 'error',
                  errorMessage: apiErrors(err, 'Could not load daily records.').join(' '),
                });
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
            service.getTemplate(stationId).pipe(
              tap((template) => patchState(store, { template, templateLoadingState: 'success' })),
              catchError((err) => {
                patchState(store, {
                  templateLoadingState: 'error',
                  templateErrorMessage: apiErrors(err, 'Could not prepare the form.').join(' '),
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      /**
       * Opens the record form. Pass `record` to edit an existing day; otherwise a new day is recorded
       * for `stationId` (null = the manager's own station).
       */
      openRecordModal(options: { stationId?: string | null; record?: DailySalesReport | null } = {}) {
        const record = options.record ?? null;
        const modalStationId = record ? record.stationId : options.stationId ?? store.stationId();
        patchState(store, {
          isRecordModalOpen: true,
          modalStationId,
          editingRecord: record,
          saveLoadingState: 'idle',
          saveErrors: [],
        });
        methods.loadTemplate(modalStationId);
      },

      closeRecordModal() {
        patchState(store, {
          isRecordModalOpen: false,
          editingRecord: null,
          template: null,
          templateLoadingState: 'idle',
          saveLoadingState: 'idle',
          saveErrors: [],
        });
      },

      clearSaveErrors() {
        patchState(store, { saveErrors: [] });
      },

      saveRecord: rxMethod<{ recordId: string | null; payload: CreateDailyRecordPayload }>(
        pipe(
          tap(() => patchState(store, { saveLoadingState: 'loading', saveErrors: [] })),
          switchMap(({ recordId, payload }) => {
            const request$ = recordId
              ? service.updateRecord(recordId, { notes: payload.notes, pumps: payload.pumps, reservoirs: payload.reservoirs })
              : service.createRecord(payload);
            return request$.pipe(
              tap((report) =>
                patchState(store, (s) => ({
                  records: [report, ...s.records.filter((r) => r.id !== report.id)].sort((a, b) =>
                    b.recordedOn.localeCompare(a.recordedOn),
                  ),
                  expandedRecordId: report.id,
                  saveLoadingState: 'success' as LoadingState,
                  isRecordModalOpen: false,
                  editingRecord: null,
                  template: null,
                })),
              ),
              catchError((err) => {
                patchState(store, {
                  saveLoadingState: 'error',
                  saveErrors: apiErrors(err, 'Could not save the daily record.'),
                });
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
