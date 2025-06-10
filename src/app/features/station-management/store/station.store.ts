import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { Station } from "../models/station.model";
import { inject } from "@angular/core";
import { StationService } from "../services/station.service";

class StationState {
  "loading": boolean;
  "error": string | null;
  "station": Station | null;
}

export const initialState: StationState = {
  loading: false,
  error: null,
  station: null
};

export const StationStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, stationService = inject(StationService)) => ({
    async loadStation() {
      patchState(store, { loading: true, error: null });
      try {
        const station = await stationService.get();
        patchState(store, { station, loading: false, error: null });
      } catch (error) {
        patchState(store, {
          error: 'Failed to load station. Please try again later.',
          loading: false
        });
      }
    }
  }))
)
