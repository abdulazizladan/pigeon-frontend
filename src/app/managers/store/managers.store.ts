import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, mergeMap } from 'rxjs';
import { ManagersService } from '../services/managers.service';
import { Manager } from '../models/manager.model';
import { StationsService } from '../../stations/services/stations.service';
import { Station } from '../../stations/models/station.model';
import { fullName } from '../../users-management/models/user.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ManagersState {
  managers: Manager[];
  searchQuery: string;
  loadingState: LoadingState;
  errorMessage: string | null;
  /** Manager id the assign-station modal is open for, or null when closed. */
  assignModalManagerId: string | null;
  updatingManagerIds: string[];
  updateErrorMessage: string | null;
}

const initialState: ManagersState = {
  managers: [],
  searchQuery: '',
  loadingState: 'idle',
  errorMessage: null,
  assignModalManagerId: null,
  updatingManagerIds: [],
  updateErrorMessage: null,
};

function apiErrorMessage(err: any, fallback: string): string {
  const m = err?.error?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' && m ? m : fallback;
}

function stationRef(station: Station) {
  return { id: station.id, name: station.name, code: station.code };
}

export const ManagersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ managers, searchQuery, assignModalManagerId }) => ({
    activeManagers: computed(() => managers().filter((m) => m.status === 'active')),
    unassignedManagers: computed(() => managers().filter((m) => m.status === 'active' && !m.station)),
    filteredManagers: computed(() => {
      const q = searchQuery().toLowerCase().trim();
      if (!q) return managers();
      return managers().filter(
        (m) =>
          m.username.toLowerCase().includes(q) ||
          fullName(m).toLowerCase().includes(q) ||
          (m.phoneNumber ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          (m.station?.name ?? '').toLowerCase().includes(q) ||
          m.status.includes(q),
      );
    }),
    totalCount: computed(() => managers().length),
    counts: computed(() => ({
      active: managers().filter((m) => m.status === 'active').length,
      inactive: managers().filter((m) => m.status === 'inactive').length,
      assigned: managers().filter((m) => m.status === 'active' && !!m.station).length,
      unassigned: managers().filter((m) => m.status === 'active' && !m.station).length,
    })),
    isAssignStationModalOpen: computed(() => assignModalManagerId() !== null),
    assignModalManager: computed(() => {
      const id = assignModalManagerId();
      return id ? managers().find((m) => m.id === id) ?? null : null;
    }),
  })),
  withMethods((store, service = inject(ManagersService), stationsService = inject(StationsService)) => ({
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },

    managerById(id: string): Manager | null {
      return store.managers().find((m) => m.id === id) ?? null;
    },

    isUpdating(id: string): boolean {
      return store.updatingManagerIds().includes(id);
    },

    openAssignStationModal(managerId: string) {
      patchState(store, { assignModalManagerId: managerId, updateErrorMessage: null });
    },

    closeAssignStationModal() {
      patchState(store, { assignModalManagerId: null, updateErrorMessage: null });
    },

    clearUpdateError() {
      patchState(store, { updateErrorMessage: null });
    },

    loadManagers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap(() =>
          service.getManagers().pipe(
            tap((managers) => patchState(store, { managers, loadingState: 'success' })),
            catchError((err) => {
              patchState(store, {
                loadingState: 'error',
                errorMessage: apiErrorMessage(err, 'Failed to load managers.'),
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    /** Puts a manager in charge of a station. The station's previous manager, if any, loses it. */
    assignStation: rxMethod<{ managerId: string; stationId: string }>(
      pipe(
        tap(({ managerId }) =>
          patchState(store, (state) => ({
            updatingManagerIds: [...state.updatingManagerIds, managerId],
            updateErrorMessage: null,
          })),
        ),
        mergeMap(({ managerId, stationId }) =>
          stationsService.updateStation(stationId, { managerId }).pipe(
            tap((station) =>
              patchState(store, (state) => ({
                managers: state.managers.map((m) => {
                  if (m.id === managerId) return { ...m, station: stationRef(station) };
                  if (m.station?.id === station.id) return { ...m, station: null };
                  return m;
                }),
                updatingManagerIds: state.updatingManagerIds.filter((x) => x !== managerId),
                assignModalManagerId: state.assignModalManagerId === managerId ? null : state.assignModalManagerId,
              })),
            ),
            catchError((err) => {
              patchState(store, (state) => ({
                updatingManagerIds: state.updatingManagerIds.filter((x) => x !== managerId),
                updateErrorMessage: apiErrorMessage(
                  err,
                  err?.status === 403 ? 'You are not allowed to assign stations.' : 'Could not assign the station.',
                ),
              }));
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    /** Removes a manager from the station they run. */
    unassignStation: rxMethod<{ managerId: string; stationId: string }>(
      pipe(
        tap(({ managerId }) =>
          patchState(store, (state) => ({
            updatingManagerIds: [...state.updatingManagerIds, managerId],
            updateErrorMessage: null,
          })),
        ),
        mergeMap(({ managerId, stationId }) =>
          stationsService.updateStation(stationId, { managerId: null }).pipe(
            tap(() =>
              patchState(store, (state) => ({
                managers: state.managers.map((m) => (m.id === managerId ? { ...m, station: null } : m)),
                updatingManagerIds: state.updatingManagerIds.filter((x) => x !== managerId),
              })),
            ),
            catchError((err) => {
              patchState(store, (state) => ({
                updatingManagerIds: state.updatingManagerIds.filter((x) => x !== managerId),
                updateErrorMessage: apiErrorMessage(
                  err,
                  err?.status === 403 ? 'You are not allowed to unassign stations.' : 'Could not unassign the station.',
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
