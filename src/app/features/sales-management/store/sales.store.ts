import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { SalesService } from "../services/sales.service";

class SalesState {
  "loading": boolean;
  "error": string | null;
}

export const initialState: SalesState = {
  loading: false,
  error: null
}

export const SalesStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, salesService = inject(SalesService)) => ({
    async loadSales() {
      patchState(store, {loading: true, error: null})
      try {

      } catch (error) {
        patchState(store, {loading: false, error: "Could not fetch sales records. Please try again later"})
      }
    },
    async addSales() {
      patchState(store, {loading: true, error: null})
      try {

      } catch (error) {
        patchState(store, {loading: false, error: "Could not fetch sales records. Please try again later"})
      }
    },
    async loadSalesByStation(id: number) {
      patchState(store, {loading: true, error: null})
      try {

      } catch (error) {
        patchState(store, {loading: false, error: "Could not fetch sales records. Please try again later"})
      }
    }
  }))
)
