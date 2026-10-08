import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime, filter } from 'rxjs';
import { SalesService } from '../services/sales.service';
import {
  RangePreset,
  SalesQuery,
  SalesSummary,
  rangeForPreset,
} from '../models/sales.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/** Sentinel for the station filter meaning "every station". */
export const ALL_STATIONS = 'all';

export interface SalesState {
  preset: RangePreset;
  customFrom: string;
  customTo: string;
  stationId: string; // a station id or ALL_STATIONS
  summary: SalesSummary | null;
  loadingState: LoadingState;
  errorMessage: string | null;
}

const defaultRange = rangeForPreset('30d');

const initialState: SalesState = {
  preset: '30d',
  customFrom: defaultRange.from,
  customTo: defaultRange.to,
  stationId: ALL_STATIONS,
  summary: null,
  loadingState: 'idle',
  errorMessage: null,
};

function apiErrorMessage(err: any, fallback: string): string {
  const m = err?.error?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' && m ? m : fallback;
}

export const SalesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ preset, customFrom, customTo, stationId, summary, loadingState }) => {
    const range = computed(() =>
      preset() === 'custom' ? { from: customFrom(), to: customTo() } : rangeForPreset(preset() as Exclude<RangePreset, 'custom'>),
    );
    return {
      range,
      isCustomRangeValid: computed(() => preset() !== 'custom' || customFrom() <= customTo()),
      /** The exact parameters the summary endpoint is called with. */
      query: computed<SalesQuery>(() => ({
        ...range(),
        stationId: stationId() === ALL_STATIONS ? null : stationId(),
      })),
      isLoading: computed(() => loadingState() === 'loading'),
      hasSales: computed(() => (summary()?.totalTransactions ?? 0) > 0),
    };
  }),
  withMethods((store, service = inject(SalesService)) => ({
    setPreset(preset: RangePreset) {
      patchState(store, { preset });
    },

    setCustomRange(from: string, to: string) {
      patchState(store, { preset: 'custom', customFrom: from, customTo: to });
    },

    setStation(stationId: string) {
      patchState(store, { stationId: stationId || ALL_STATIONS });
    },

    /**
     * Loads the summary for a query. Pass `store.query` (the signal itself) so the
     * summary refetches whenever a filter changes. The previous summary is kept
     * while loading so the chart holds its frame instead of flashing empty.
     */
    loadSummary: rxMethod<SalesQuery>(
      pipe(
        filter((q) => q.from <= q.to),
        debounceTime(120),
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap((query) =>
          service.getSummary(query).pipe(
            tap((summary) => patchState(store, { summary, loadingState: 'success' })),
            catchError((err) => {
              patchState(store, {
                loadingState: 'error',
                errorMessage: apiErrorMessage(err, 'Failed to load sales summary.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
