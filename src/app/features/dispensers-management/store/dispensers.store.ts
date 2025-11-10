import { inject } from "@angular/core";
import { Dispenser } from "../models/dispenser.model"
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { DispenserService } from "../services/dispenser.service";

class DispenserState {
  "dispensers": Dispenser[];
  "selectedDispenser": Dispenser | null;
  "loading": boolean;
  "error": string | null;
}

const initialState: DispenserState = {
  dispensers: [],
  selectedDispenser: null,
  loading: false,
  error: null
}

export const DispenserStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, dispenserService = inject(DispenserService)) => ({
    async loadDispensers() {
      patchState(store, {loading: true, error: null});
      try {
        const dispenserss = await dispenserService.get();
        patchState(store, {dispensers: dispenserss, loading: false, error: null});
      }catch (error) {
        patchState(store, {loading: false, error: "Unable to fetch dispensers. Check your connection and try again later."})
      }
    },
    async addDispenser(dispenser: Dispenser) {
      patchState(
        store, {
          loading: true, 
          error: null
        }
      );
      try{
        const newDispenser = await dispenserService.create(dispenser);
        patchState(store, state => ({
          dispensers: [
            ...state.dispensers, 
            newDispenser
          ],
          loading: false,
          error: null
        }))
      } catch (error) {
        patchState(
          store, {
            loading: false,
            error: "Unable to add dispenser. Check your connection and try again."
          }
        )
      }
    }
  }))
)
