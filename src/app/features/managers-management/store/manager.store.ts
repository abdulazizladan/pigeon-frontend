import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ManagersService } from "../services/managers.service";
import { Manager } from "../models/manager.model";
import { User } from "../../users-management/models/user.model";

/**export class NewManager {
  "email": string;
  "role": string;
  "status": string;
  "info": {
    "firstName": string;
    "lastName": string;
    "image": string;
  };
  "contact": {
    "phone": string;
  }
}**/


class ManagersState {
  "managers": Manager[];
  "selectedManager": Manager | null;
  "loading": boolean;
  "error": string | null;
}

const initialState: ManagersState = {
  managers: [],
  selectedManager: null,
  loading: false,
  error: null
}

export const ManagersStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, managersService = inject(ManagersService)) => ({
  
    /**
     * 
     */
    async loadManagers() {
      patchState(
        store, {
          loading: true,
          error: null
        }
      )
      try{
        const allManagers = await managersService.getManagers();
        patchState(store, {managers: allManagers, loading: false, error: null})
      }catch (error) {
        const message = (error as any)?.message || 'Failed to load managers list. Please check the network.';
        patchState(
          store, {
          loading: false,
          error: "Failed to load managers. Please try again later"
          }
        )
      }
    },

    /**
     * 
     */
    async loadSelectedManager( id: string) {
      patchState(
        store, {
          loading: true,
          error: null
        }
      )
      try{
        const manager = await (managersService as any).getById(id);
        patchState(store, {
          selectedManager: manager, 
          loading: false, 
          error: null
        })
      }catch (error) {
        const message = (error as any)?.message || 'Failed to load managers list. Please check the network.';
        patchState(
          store, {
          loading: false,
          error: "Failed to load managers. Please try again later",
          selectedManager: null
          }
        )
      }
    },
    /**
     * 
     * @param manager 
     */
    async addManager(manager: User) {
      patchState(
        store, {
          loading: true,
          error: null
        }
      )
      try{
        const response = await managersService.add(manager)
        if(!response) {
          throw new Error("Failed to create a new manager on the server")
        }
        patchState(store, state => ({
          managers: [
            ...state.managers,
            response
          ],
          loading: false
        }));
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
