import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { Station } from "../models/station.model";
import { StationsService } from "../services/stations.service";
import { inject } from "@angular/core";

class StationsState {
  "stations": Station[];
  "selectedStation": Station | null;
  "loading": boolean;
  "error": string | null;
}

const initialState: StationsState = {
  stations: [],
  selectedStation: null,
  loading: false,
  error: null
}

export const StationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, stationsService = inject(StationsService)) => ({
    async loadStations() {
      patchState(store, { loading: true, error: null });
      try {
        const stations = await stationsService.get();
        patchState(store, { stations, loading: false, error: null });
      } catch (error) {
        patchState(store, {
          error: 'Failed to load stations. Please try again later.',
          loading: false
        });
      }
    },
    async selectStation(id: number) {
      patchState(store, { loading: true, error: null });
      try {
        const station = await stationsService.getById(id);
        patchState(store, { selectedStation: station, loading: false });
      } catch (error) {
        console.log('Error selecting station: ', error);
        patchState(store, {
          error: 'Failed to load station. Please try again later.',
          loading: false
        });
      }
    },
    async addStation(station: Station) {
      patchState(store, { loading: true, error: null})
      try {
        const newStation = await stationsService.createStation(station);
        patchState(store, state=> ({
          stations: [...state.stations, station],
          loading: false,
          error: null
        }))
      } catch (error) {
        patchState(store, {
          loading: false,
          error: 'Unable to add new station. Please check your connection and try again.'
        })
      }
    }
  }))
)
