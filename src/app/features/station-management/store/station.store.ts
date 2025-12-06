import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { StationService } from '../services/station-service';
import { Station } from '../models/station.model';

interface StationState {
  station: Station | null;
  loading: boolean;
  error: string | null;
}

const initialState: StationState = {
  station: null,
  loading: false,
  error: null
};

export const StationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, stationService = inject(StationService)) => ({
    /**
     * Loads station data by ID
     * @param id The station ID
     */
    async loadStation(id: string) {
      patchState(store, { loading: true, error: null });
      try {
        const station = await stationService.getStationById(id);
        patchState(store, {
          station,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading station:', error);
        patchState(store, {
          loading: false,
          error: 'Failed to load station. Please check your connection and try again.',
          station: null
        });
      }
    },

    /**
     * Clears the station data from the store
     */
    clearStation() {
      patchState(store, {
        station: null,
        error: null
      });
    }
  }))
);

