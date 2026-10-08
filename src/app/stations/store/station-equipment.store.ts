import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, forkJoin, mergeMap } from 'rxjs';
import { StationEquipmentService } from '../services/station-equipment.service';
import {
  CreatePumpPayload,
  CreateReservoirPayload,
  PRODUCTS,
  Product,
  ProductPrice,
  Pump,
  Reservoir,
  UpdatePumpPayload,
  UpdateReservoirPayload,
} from '../models/equipment.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface StationEquipmentState {
  stationId: string | null;
  prices: ProductPrice[];
  pumps: Pump[];
  reservoirs: Reservoir[];
  loadingState: LoadingState;
  errorMessage: string | null;
  isAddPumpModalOpen: boolean;
  isAddReservoirModalOpen: boolean;
  saveLoadingState: LoadingState;
  saveErrorMessage: string | null;
  /** Ids (pump, reservoir) or product keys currently being saved inline. */
  savingKeys: string[];
}

const initialState: StationEquipmentState = {
  stationId: null,
  prices: [],
  pumps: [],
  reservoirs: [],
  loadingState: 'idle',
  errorMessage: null,
  isAddPumpModalOpen: false,
  isAddReservoirModalOpen: false,
  saveLoadingState: 'idle',
  saveErrorMessage: null,
  savingKeys: [],
};

function apiErrorMessage(err: any, fallback: string): string {
  const m = err?.error?.message;
  if (Array.isArray(m)) return m.join(' ');
  return typeof m === 'string' && m ? m : fallback;
}

export const StationEquipmentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ prices, pumps, reservoirs }) => ({
    activePumps: computed(() => pumps().filter((p) => p.status === 'active')),
    pumpsByProduct: computed(() => {
      const groups = Object.fromEntries(PRODUCTS.map((p) => [p, [] as Pump[]])) as Record<Product, Pump[]>;
      for (const pump of pumps()) groups[pump.product].push(pump);
      return groups;
    }),
    priceByProduct: computed(() => {
      const map = {} as Record<Product, number | null>;
      for (const p of PRODUCTS) map[p] = prices().find((x) => x.product === p)?.pricePerLitre ?? null;
      return map;
    }),
    hasAllPrices: computed(() => PRODUCTS.every((p) => prices().some((x) => x.product === p && x.pricePerLitre !== null))),
    /** Products without a reservoir yet, offered when adding one. */
    missingReservoirProducts: computed(() => PRODUCTS.filter((p) => !reservoirs().some((r) => r.product === p))),
  })),
  withMethods((store, service = inject(StationEquipmentService)) => {
    const addKey = (key: string) =>
      patchState(store, (s) => ({ savingKeys: [...s.savingKeys, key], saveErrorMessage: null }));
    const dropKey = (key: string) =>
      patchState(store, (s) => ({ savingKeys: s.savingKeys.filter((k) => k !== key) }));

    return {
      isSaving(key: string): boolean {
        return store.savingKeys().includes(key);
      },

      openAddPumpModal() {
        patchState(store, { isAddPumpModalOpen: true, saveErrorMessage: null, saveLoadingState: 'idle' });
      },
      closeAddPumpModal() {
        patchState(store, { isAddPumpModalOpen: false, saveErrorMessage: null, saveLoadingState: 'idle' });
      },
      openAddReservoirModal() {
        patchState(store, { isAddReservoirModalOpen: true, saveErrorMessage: null, saveLoadingState: 'idle' });
      },
      closeAddReservoirModal() {
        patchState(store, { isAddReservoirModalOpen: false, saveErrorMessage: null, saveLoadingState: 'idle' });
      },
      clearSaveError() {
        patchState(store, { saveErrorMessage: null });
      },

      /** Loads prices, pumps and reservoirs for one station in a single pass. */
      loadForStation: rxMethod<string>(
        pipe(
          tap((stationId) => patchState(store, { stationId, loadingState: 'loading', errorMessage: null })),
          switchMap((stationId) =>
            forkJoin({
              prices: service.getPrices(stationId),
              pumps: service.getPumps(stationId),
              reservoirs: service.getReservoirs(stationId),
            }).pipe(
              tap(({ prices, pumps, reservoirs }) =>
                patchState(store, { prices, pumps, reservoirs, loadingState: 'success' }),
              ),
              catchError((err) => {
                patchState(store, {
                  loadingState: 'error',
                  errorMessage: apiErrorMessage(err, 'Could not load station equipment.'),
                });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      setPrice: rxMethod<{ product: Product; pricePerLitre: number }>(
        pipe(
          tap(({ product }) => addKey(`price:${product}`)),
          mergeMap(({ product, pricePerLitre }) => {
            const stationId = store.stationId();
            if (!stationId) return EMPTY;
            return service.setPrice(stationId, product, pricePerLitre).pipe(
              tap((saved) =>
                patchState(store, (s) => ({
                  prices: s.prices.map((p) =>
                    p.product === product
                      ? { product, pricePerLitre: saved.pricePerLitre, updatedAt: saved.updatedAt ?? new Date().toISOString() }
                      : p,
                  ),
                })),
              ),
              catchError((err) => {
                patchState(store, { saveErrorMessage: apiErrorMessage(err, 'Could not save the price.') });
                return EMPTY;
              }),
              tap({ finalize: () => dropKey(`price:${product}`) }),
            );
          }),
        ),
      ),

      createPump: rxMethod<CreatePumpPayload>(
        pipe(
          tap(() => patchState(store, { saveLoadingState: 'loading', saveErrorMessage: null })),
          switchMap((payload) => {
            const stationId = store.stationId();
            if (!stationId) return EMPTY;
            return service.createPump(stationId, payload).pipe(
              tap((pump) =>
                patchState(store, (s) => ({
                  pumps: [...s.pumps, pump].sort((a, b) => a.name.localeCompare(b.name)),
                  saveLoadingState: 'success' as LoadingState,
                  isAddPumpModalOpen: false,
                })),
              ),
              catchError((err) => {
                patchState(store, {
                  saveLoadingState: 'error',
                  saveErrorMessage: apiErrorMessage(err, 'Could not add the pump.'),
                });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      updatePump: rxMethod<{ id: string; changes: UpdatePumpPayload }>(
        pipe(
          tap(({ id }) => addKey(id)),
          mergeMap(({ id, changes }) =>
            service.updatePump(id, changes).pipe(
              tap((pump) => patchState(store, (s) => ({ pumps: s.pumps.map((p) => (p.id === pump.id ? pump : p)) }))),
              catchError((err) => {
                patchState(store, { saveErrorMessage: apiErrorMessage(err, 'Could not update the pump.') });
                return EMPTY;
              }),
              tap({ finalize: () => dropKey(id) }),
            ),
          ),
        ),
      ),

      /** Removes a pump after the caller has confirmed. Keyed by pump id in savingKeys while in flight. */
      deletePump: rxMethod<string>(
        pipe(
          tap((id) => addKey(id)),
          mergeMap((id) =>
            service.deletePump(id).pipe(
              tap(() => patchState(store, (s) => ({ pumps: s.pumps.filter((p) => p.id !== id) }))),
              catchError((err) => {
                patchState(store, { saveErrorMessage: apiErrorMessage(err, 'Could not remove the pump.') });
                return EMPTY;
              }),
              tap({ finalize: () => dropKey(id) }),
            ),
          ),
        ),
      ),

      createReservoir: rxMethod<CreateReservoirPayload>(
        pipe(
          tap(() => patchState(store, { saveLoadingState: 'loading', saveErrorMessage: null })),
          switchMap((payload) => {
            const stationId = store.stationId();
            if (!stationId) return EMPTY;
            return service.createReservoir(stationId, payload).pipe(
              tap((reservoir) =>
                patchState(store, (s) => ({
                  reservoirs: [...s.reservoirs, reservoir].sort((a, b) => a.product.localeCompare(b.product)),
                  saveLoadingState: 'success' as LoadingState,
                  isAddReservoirModalOpen: false,
                })),
              ),
              catchError((err) => {
                patchState(store, {
                  saveLoadingState: 'error',
                  saveErrorMessage: apiErrorMessage(err, 'Could not add the reservoir.'),
                });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      updateReservoir: rxMethod<{ id: string; changes: UpdateReservoirPayload }>(
        pipe(
          tap(({ id }) => addKey(id)),
          mergeMap(({ id, changes }) =>
            service.updateReservoir(id, changes).pipe(
              tap((reservoir) =>
                patchState(store, (s) => ({
                  reservoirs: s.reservoirs.map((r) => (r.id === reservoir.id ? reservoir : r)),
                })),
              ),
              catchError((err) => {
                patchState(store, { saveErrorMessage: apiErrorMessage(err, 'Could not update the reservoir.') });
                return EMPTY;
              }),
              tap({ finalize: () => dropKey(id) }),
            ),
          ),
        ),
      ),
    };
  }),
);
