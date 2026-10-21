import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime, filter } from 'rxjs';
import { SalesService } from '../services/sales.service';
import { RangePreset, SalesQuery, SalesSummary, rangeForPreset } from '../models/sales.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface StationSalesState {
  /** null = the caller's own station (managers). */
  stationId: string | null;
  preset: RangePreset;
  customFrom: string;
  customTo: string;
  summary: SalesSummary | null;
  loadingState: LoadingState;
  errorMessage: string | null;
}

const defaultRange = rangeForPreset('30d');

const initialState: StationSalesState = {
  stationId: null,
  preset: '30d',
  customFrom: defaultRange.from,
  customTo: defaultRange.to,
  summary: null,
  loadingState: 'idle',
  errorMessage: null,
};

/**
 * Sales summary for one station with its own period filter. Not provided in root on purpose:
 * each chart component gets its own instance, so a station page and the director dashboard
 * never fight over one filter.
 */
export const StationSalesStore = signalStore(
  withState(initialState),
  withComputed(({ preset, customFrom, customTo, stationId, summary, loadingState }) => {
    const range = computed(() =>
      preset() === 'custom'
        ? { from: customFrom(), to: customTo() }
        : rangeForPreset(preset() as Exclude<RangePreset, 'custom'>),
    );
    return {
      range,
      isCustomRangeValid: computed(() => preset() !== 'custom' || customFrom() <= customTo()),
      query: computed<SalesQuery>(() => ({ ...range(), stationId: stationId() })),
      isLoading: computed(() => loadingState() === 'loading'),
      hasSales: computed(() => (summary()?.totalTransactions ?? 0) > 0),
    };
  }),
  withMethods((store, service = inject(SalesService)) => ({
    setStation(stationId: string | null) {
      if (store.stationId() !== stationId) patchState(store, { stationId, summary: null });
    },
    setPreset(preset: RangePreset) {
      patchState(store, { preset });
    },
    setCustomRange(from: string, to: string) {
      patchState(store, { preset: 'custom', customFrom: from, customTo: to });
    },
    /** Pass `store.query` (the signal) so the chart refetches whenever the filter changes. */
    loadSummary: rxMethod<SalesQuery>(
      pipe(
        filter((q) => q.from <= q.to),
        debounceTime(120),
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap((query) =>
          service.getSummary(query).pipe(
            tap((summary) => patchState(store, { summary, loadingState: 'success' })),
            catchError((err) => {
              const m = err?.error?.message;
              patchState(store, {
                loadingState: 'error',
                errorMessage: Array.isArray(m) ? m.join(' ') : typeof m === 'string' && m ? m : 'Failed to load sales.',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
