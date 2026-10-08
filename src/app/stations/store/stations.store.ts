import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, mergeMap } from 'rxjs';
import { StationsService } from '../services/stations.service';
import {
  CreateStationPayload,
  Station,
  StationStats,
  StationStatus,
  UpdateStationPayload,
  STATION_STATUSES,
  stationLocation,
} from '../models/station.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface StationsState {
  stations: Station[];
  stats: StationStats | null;
  searchQuery: string;
  loadingState: LoadingState;
  statsLoadingState: LoadingState;
  errorMessage: string | null;
  createLoadingState: LoadingState;
  createErrorMessage: string | null;
  isAddStationModalOpen: boolean;
  /** Station id the assign-manager modal is open for, or null when closed. */
  assignModalStationId: string | null;
  updatingStationIds: string[];
  updateErrorMessage: string | null;
  /** The logged-in manager's own station (null once loaded if unassigned). */
  myStation: Station | null;
  myStationLoadingState: LoadingState;
  myStationErrorMessage: string | null;
}

const initialState: StationsState = {
  stations: [],
  stats: null,
  searchQuery: '',
  loadingState: 'idle',
  statsLoadingState: 'idle',
  errorMessage: null,
  createLoadingState: 'idle',
  createErrorMessage: null,
  isAddStationModalOpen: false,
  assignModalStationId: null,
  updatingStationIds: [],
  updateErrorMessage: null,
  myStation: null,
  myStationLoadingState: 'idle',
  myStationErrorMessage: null,
};

function apiErrorMessage(err: any, fallback: string): string {
  const m = err?.error?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' && m ? m : fallback;
}

export const StationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ stations, stats, searchQuery, assignModalStationId }) => ({
    isAssignManagerModalOpen: computed(() => assignModalStationId() !== null),
    assignModalStation: computed(() => {
      const id = assignModalStationId();
      return id ? stations().find((s) => s.id === id) ?? null : null;
    }),
    filteredStations: computed(() => {
      const q = searchQuery().toLowerCase().trim();
      if (!q) return stations();
      return stations().filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          stationLocation(s).toLowerCase().includes(q) ||
          (s.managerUsername ?? '').toLowerCase().includes(q) ||
          s.status.includes(q),
      );
    }),
    totalCount: computed(() => stations().length),
    statusCounts: computed(() => {
      const counts = Object.fromEntries(STATION_STATUSES.map((s) => [s, 0])) as Record<StationStatus, number>;
      for (const s of stations()) counts[s.status]++;
      return counts;
    }),
    activeStations: computed(() => stations().filter((s) => s.status === 'active')),
    /** Manager ids that already run a station, for disabling them in assignment pickers. */
    assignedManagerIds: computed(() => new Set(stations().map((s) => s.managerId).filter((id): id is string => !!id))),
    hasStats: computed(() => stats() !== null),
  })),
  withMethods((store, service = inject(StationsService)) => ({
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },

    openAddStationModal() {
      patchState(store, { isAddStationModalOpen: true, createErrorMessage: null, createLoadingState: 'idle' });
    },

    closeAddStationModal() {
      patchState(store, { isAddStationModalOpen: false, createErrorMessage: null, createLoadingState: 'idle' });
    },

    resetCreateState() {
      patchState(store, { createLoadingState: 'idle', createErrorMessage: null });
    },

    openAssignManagerModal(stationId: string) {
      patchState(store, { assignModalStationId: stationId, updateErrorMessage: null });
    },

    closeAssignManagerModal() {
      patchState(store, { assignModalStationId: null, updateErrorMessage: null });
    },

    clearUpdateError() {
      patchState(store, { updateErrorMessage: null });
    },

    isUpdating(id: string): boolean {
      return store.updatingStationIds().includes(id);
    },

    /** Finds a station already in the store; the details page uses this before falling back to a load. */
    stationById(id: string): Station | null {
      return store.stations().find((s) => s.id === id) ?? null;
    },

    updateStation: rxMethod<{ id: string; changes: UpdateStationPayload }>(
      pipe(
        tap(({ id }) =>
          patchState(store, (state) => ({
            updatingStationIds: [...state.updatingStationIds, id],
            updateErrorMessage: null,
          })),
        ),
        mergeMap(({ id, changes }) =>
          service.updateStation(id, changes).pipe(
            tap((updated) =>
              patchState(store, (state) => ({
                stations: state.stations.map((s) => (s.id === updated.id ? updated : s)),
                updatingStationIds: state.updatingStationIds.filter((x) => x !== id),
                // A successful assignment closes the picker.
                assignModalStationId: state.assignModalStationId === id ? null : state.assignModalStationId,
              })),
            ),
            catchError((err) => {
              patchState(store, (state) => ({
                updatingStationIds: state.updatingStationIds.filter((x) => x !== id),
                updateErrorMessage: apiErrorMessage(
                  err,
                  err?.status === 403 ? 'You are not allowed to update stations.' : 'Could not update the station.',
                ),
              }));
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadStations: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap(() =>
          service.getStations().pipe(
            tap((stations) => patchState(store, { stations, loadingState: 'success' })),
            catchError((err) => {
              patchState(store, {
                loadingState: 'error',
                errorMessage: apiErrorMessage(err, 'Failed to load stations.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadMyStation: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { myStationLoadingState: 'loading', myStationErrorMessage: null })),
        switchMap(() =>
          service.getMyStation().pipe(
            tap((myStation) => patchState(store, { myStation, myStationLoadingState: 'success' })),
            catchError((err) => {
              patchState(store, {
                myStationLoadingState: 'error',
                myStationErrorMessage: apiErrorMessage(err, 'Could not load your station.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { statsLoadingState: 'loading' })),
        switchMap(() =>
          service.getStats().pipe(
            tap((stats) => patchState(store, { stats, statsLoadingState: 'success' })),
            catchError((err) => {
              patchState(store, {
                statsLoadingState: 'error',
                errorMessage: apiErrorMessage(err, 'Failed to load station statistics.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    createStation: rxMethod<CreateStationPayload>(
      pipe(
        tap(() => patchState(store, { createLoadingState: 'loading', createErrorMessage: null })),
        switchMap((payload) =>
          service.createStation(payload).pipe(
            tap((station) =>
              patchState(store, (state) => ({
                stations: [...state.stations, station].sort((a, b) => a.name.localeCompare(b.name)),
                createLoadingState: 'success' as LoadingState,
                isAddStationModalOpen: false,
              })),
            ),
            catchError((err) => {
              patchState(store, {
                createLoadingState: 'error',
                createErrorMessage: apiErrorMessage(err, 'Could not create the station. Please try again.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
