import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { DirectorService } from "../services/director.service";
import { User } from "../models/user.model";

class DirectorState {
  "loading": boolean;
  "error": string | null;
  "userProfile": User;
  "profile": User | null
}

const initialState: DirectorState = {
  loading: false,
  error: null,
  profile: null,
  userProfile: {
    id: 0,
    email: '',
    role: '',
    status: 'active',
    password: '',
    info: {
      firstName: '',
      lastName: '',
      image: '',
      age: 0
    },
    contact: {
      phone: ""
    }
  }
}

export const DirectorStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, directorService = inject(DirectorService)) => ({
    async loadSummary() {
      patchState(store, {loading: true, error: null})
      try {
        const summary = await directorService.getStations();
      } catch (error) {
        patchState(store, {
          loading: false,
          error: 'Failed toload data. Please check your connection and try again.'
        })
      }
    },
    async loadProfile(email: string) {
      patchState(store, {loading: true, error: null});
      try{
        const profile = await directorService.getProfile(email);
        patchState(store, {profile, loading: false});
      }catch (error) {
        patchState(store, {
          error: 'Failed to load profile. Please check your connection and try again.',
          loading: false
        })
      }
    }
  }))
)
