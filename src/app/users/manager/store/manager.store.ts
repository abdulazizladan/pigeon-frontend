import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ManagerService } from "../services/manager.service";
import { User } from "../models/user.model";

export class ManagerState {
  //"stationSummary"
  "loading": boolean;
  "error": string | null;
  "profile": User| null;
}

const initialState: ManagerState = {
  loading: false,
  error: null,
  profile: null
}

export const ManagerStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, managerService = inject(ManagerService)) => ({
    async loadSummary() {
      patchState(store, {loading: true, error: null})
      try {

      } catch (error) {
        patchState(store, {loading: false, error: 'Error loadingdata. Please check your connection and try again'})
      }
    }, 
    async loadProfile(email: string) {
      patchState(store, {loading: true, error: null})
      try {
        const userProfile = await managerService.getProfile(email);
        patchState(store, {error: null, loading: false, profile: userProfile})
      } catch (error) {
        patchState(store, {
          loading: false,
          error: 'Error loading data. Please check your connection and try again'})
      }
    }
  }))
)
