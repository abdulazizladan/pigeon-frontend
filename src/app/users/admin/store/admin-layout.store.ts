import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface AdminLayoutState {
  isSidebarOpen: boolean;
}

const initialState: AdminLayoutState = {
  isSidebarOpen: true,
};

/** UI state shared by the admin shell (navbar, drawer, main area). */
export const AdminLayoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    toggleSidebar() {
      patchState(store, (state) => ({ isSidebarOpen: !state.isSidebarOpen }));
    },
    openSidebar() {
      patchState(store, { isSidebarOpen: true });
    },
    closeSidebar() {
      patchState(store, { isSidebarOpen: false });
    },
  })),
);
