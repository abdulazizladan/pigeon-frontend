import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { SalesService } from "../services/sales.service";
import { Sale } from "../models/sale.model";

class SalesState {
  "sales": Sale[];
  "selectedSale": Sale | null;
  "loading": boolean;
  "error": string | null;
}

export const initialState: SalesState = {
  sales: [],
  selectedSale: null,
  loading: false,
  error: null
}

export const SalesStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, salesService = inject(SalesService)) => ({
    async addSale(sale: Sale){
      patchState(store, {loading: true, error: null})
      try {
        
      } catch (error) {
        patchState(store, {loading: false, error: "Could not fetch sales records. Please try again later"})
      }
    },
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
