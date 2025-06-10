import { inject } from "@angular/core";
import { Manager } from "../models/manager.moel";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ManagersService } from "../services/managers.service";
import { User } from "../../users-management/models/user.model";

class ManagersState {
  "managers": User[];
  "loading": boolean;
  "error": string | null;
}

const initialState: ManagersState = {
  managers: [],
  loading: false,
  error: null
}

export const ManagersStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, managersService = inject(ManagersService)) => ({
    async loadManagers() {
      patchState(
        store, {
          loading: true,
          error: null
        }
      )
      try{
        const managers = await managersService.getManagers();
        patchState(store, {managers, loading: false, error: null})
      }catch (error) {
        patchState(
          store, {
          loading: false,
          error: "Failed to load managers. Please try again later"
          }
        )
      }
    },
    addManager(manager: Manager) {
      patchState(
        store, {
          loading: true,
          error: null
        }
      )
      try{

      }catch (error) {
        patchState(
          store, {
          loading: false,
          error: "Failed to add manager. Please try again later"
          }
        )
      }
    }
  }))
)
