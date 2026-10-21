import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { StationEquipmentService } from '../services/station-equipment.service';
import { RecordLevelsPayload, StationLevels } from '../models/equipment.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ReservoirLevelsState {
  /** null = the signed-in manager's own station. */
  stationId: string | null;
  levels: StationLevels | null;
  loadingState: LoadingState;
  errorMessage: string | null;
  isRecordModalOpen: boolean;
  saveLoadingState: LoadingState;
  saveErrors: string[];
}

const initialState: ReservoirLevelsState = {
  stationId: null,
  levels: null,
  loadingState: 'idle',
  errorMessage: null,
  isRecordModalOpen: false,
  saveLoadingState: 'idle',
  saveErrors: [],
};

function apiErrors(err: any, fallback: string): string[] {
  const m = err?.error?.message;
  if (Array.isArray(m) && m.length) return m.map(String);
  if (typeof m === 'string' && m) return [m];
  return [fallback];
}

export const ReservoirLevelsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ levels, loadingState, saveLoadingState }) => ({
    reservoirs: computed(() => levels()?.reservoirs ?? []),
    isLoading: computed(() => loadingState() === 'loading'),
    isSaving: computed(() => saveLoadingState() === 'loading'),
    lowCount: computed(() => (levels()?.reservoirs ?? []).filter((r) => r.status === 'low' || r.status === 'critical').length),
    unreadCount: computed(() => (levels()?.reservoirs ?? []).filter((r) => r.status === 'unknown').length),
  })),
  withMethods((store, service = inject(StationEquipmentService)) => ({
    setStation(stationId: string | null) {
      if (store.stationId() !== stationId) patchState(store, { stationId, levels: null, loadingState: 'idle' });
    },

    loadLevels: rxMethod<string | null>(
      pipe(
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap((stationId) =>
          service.getReservoirLevels(stationId).pipe(
            tap((levels) => patchState(store, { levels, loadingState: 'success' })),
            catchError((err) => {
              patchState(store, { loadingState: 'error', errorMessage: apiErrors(err, 'Could not load reservoir levels.').join(' ') });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    openRecordModal() {
      patchState(store, { isRecordModalOpen: true, saveLoadingState: 'idle', saveErrors: [] });
    },

    closeRecordModal() {
      patchState(store, { isRecordModalOpen: false, saveLoadingState: 'idle', saveErrors: [] });
    },

    recordLevels: rxMethod<RecordLevelsPayload>(
      pipe(
        tap(() => patchState(store, { saveLoadingState: 'loading', saveErrors: [] })),
        switchMap((payload) =>
          service.recordReservoirLevels(payload).pipe(
            tap((levels) => patchState(store, { levels, saveLoadingState: 'success', isRecordModalOpen: false })),
            catchError((err) => {
              patchState(store, { saveLoadingState: 'error', saveErrors: apiErrors(err, 'Could not save the levels.') });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
