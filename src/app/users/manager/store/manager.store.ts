import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ManagerService } from "../services/manager.service";
import { User } from "../models/user.model";
import { Station } from "../../../features/station-management/models/station.model";

export class ManagerState {
  //"stationSummary"
  "loading": boolean;
  "error": string | null;
  "profile": User | null;
  "station": Station | null;
}

const initialState: ManagerState = {
  loading: false,
  error: null,
  profile: null,
  station: null
}

export const ManagerStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, managerService = inject(ManagerService)) => ({
    async loadSummary() {
      patchState(store, { loading: true, error: null })
      try {

      } catch (error) {
        patchState(store, { loading: false, error: 'Error loadingdata. Please check your connection and try again' })
      }
    },
    async loadProfile(email: string) {
      patchState(store, { loading: true, error: null })
      try {
        const userProfile = await managerService.getProfile(email);
        patchState(store, { error: null, loading: false, profile: userProfile })
      } catch (error) {
        patchState(store, {
          loading: false,
          error: 'Error loading data. Please check your connection and try again'
        })
      }
    },
    async loadStation(stationId: string) {
      patchState(store, { loading: true, error: null })
      try {
        const station = await managerService.getMyStation(stationId);
        patchState(store, { error: null, loading: false, station: station })
      } catch (error) {
        patchState(store, {
          loading: false,
          error: 'Error loading station. Please check your connection and try again'
        })
      }
    }
  }))
)
