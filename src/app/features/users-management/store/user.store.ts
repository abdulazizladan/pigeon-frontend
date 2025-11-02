// users.store.ts

import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { inject } from '@angular/core';
import { UserService } from '../services/users.service';
import { User } from '../models/user.model';
import { UserDetail } from '../models/user-detail.model';
import { computed } from '@angular/core';

// --- Type Definitions ---

/** Standard structure for all API responses. */
interface BackendResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface UserState {
  users: User[];
  selectedUser: UserDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null
};

// --- Store Implementation ---

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // ⭐️ OPTIMIZATION 1: Add a computed signal for derived state
  withComputed(({ users, selectedUser, loading }) => ({
    // A selector that indicates if the data is ready (e.g., for showing the UI)
    isDataLoaded: computed(() => users().length > 0 && !loading()),
    // A selector for a list of active users
    activeUsers: computed(() => users().filter(u => u.status === 'active')),
    // Check if the selected user is active
    isSelectedUserActive: computed(() => selectedUser()?.status === 'active'),
  })),

  withMethods((store, userService = inject(UserService)) => ({

    // ⭐️ OPTIMIZATION 2: Centralized error handling helper
    handleError(error: any, defaultMessage: string): void {
      console.error('API Error:', error);
      patchState(store, {
        error: error?.message || defaultMessage,
        loading: false
      });
    },

    // --- Load Users ---
    async loadUsers() {
      patchState(store, { loading: true, error: null });
      try {
        // Assuming userService.getUsers() returns Promise<BackendResponse<User[]>>
        const response: User[] = await userService.getUsers();
        
        // ⭐️ OPTIMIZATION 3: Ensure you use response.data
        if (!response) {
           throw new Error( 'Failed to fetch users from the server.');
        }

        patchState(store, { users: response, loading: false }); 
      } catch (error) {
        this.handleError(error, 'Failed to load users. Please try again later.');
      }
    },
    
    // --- Select User ---
    async selectUser(email: string) {
      patchState(store, { loading: true, error: null, selectedUser: null }); // Clear previous selection
      try {
        const response: UserDetail = await userService.getUserByEmail(email); 
        
        if (!response) {
           throw new Error( `Failed to find user with email: ${email}.`);
        }
        
        patchState(store, { selectedUser: response, loading: false });
      } catch (error) {
        this.handleError(error, 'Failed to load user details. Please try again later.');
      }
    },
    
    // --- Add User ---
    async addUser(user: User) {
      patchState(
        store, { 
          loading: true, 
          error: null 
        }
      );
      try {
        const response = await userService.createUser(user); 
        if (!response) {
           throw new Error( 'Failed to create user on the server.');
        }
        // ⭐️ OPTIMIZATION 4: Update the array immutably with the new user from the backend
        patchState(store, state => ({
          users: [
            ...state.users, 
            response
          ],
          loading: false,
        }));
      } catch (error) {
        patchState(
          store, {
            loading: false,
            error: "Failed to add manager. Please try again later"
          }
        )
      }
    },
    
    // --- Update User ---
    async updateUser(user: User) {
      patchState(store, { loading: true, error: null });
      try {
        const response: User = await userService.updateUser(user);
        
        if (!response) {
           throw new Error( 'Failed to update user on the server.');
        }
        
        const updatedUser = response;
        
        // ⭐️ OPTIMIZATION 5: Immutable update via map
        patchState(store, state => ({
          users: state.users.map(u => 
            u.id === updatedUser.id ? updatedUser : u
          ),
          // ⭐️ OPTIMIZATION 6: Update selected user if it matches
          selectedUser: state.selectedUser?.id === updatedUser.id
            ? { ...state.selectedUser, ...updatedUser, info: { ...state.selectedUser.info, ...updatedUser.info }, contact: { ...state.selectedUser.contact, ...updatedUser.contact } }
            : state.selectedUser,
          loading: false, 
        }));
      } catch (error) {
        this.handleError(error, 'Failed to update user. Please try again later.');
      }
    },
    
    // --- Suspend User ---
    async suspendUser(email: string) {
      patchState(store, {loading: true, error: null});
      try {
        const response = await userService.suspendUser(email); 
        
        // Assume suspendUser returns the updated user or a generic success response
        if (!response ) {
           throw new Error( 'Suspend operation failed on the server.');
        }

        // ⭐️ OPTIMIZATION 7: Immutable state update for the suspension statu
        patchState(store, state => ({
          users: state.users.map(u => {
            if (u.email === email) {
              return { ...u, status: 'inactive' }; // Assumed status change
            }
            return u;
          }),
          // Update selected user status if it matches
          selectedUser: state.selectedUser?.email === email
            ? { ...state.selectedUser, status: 'inactive' }
            : state.selectedUser,
          loading: false, 
        }));
      } catch(error) {
        this.handleError(error, 'Unable to suspend user. Please check your connection and try again later.');
      }
    },
    async enableUser(email: string) {
      patchState(store, {loading: true, error: null});
      try {
        const response = await userService.enableUser(email); 
        
        // Assume suspendUser returns the updated user or a generic success response
        if (!response ) {
           throw new Error( 'Suspend operation failed on the server.');
        }

        // ⭐️ OPTIMIZATION 7: Immutable state update for the suspension statu
        patchState(store, state => ({
          users: state.users.map(u => {
            if (u.email === email) {
              return { ...u, status: 'active' }; // Assumed status change
            }
            return u;
          }),
          // Update selected user status if it matches
          selectedUser: state.selectedUser?.email === email
            ? { ...state.selectedUser, status: 'active' }
            : state.selectedUser,
          loading: false, 
        }));
      } catch(error) {
        this.handleError(error, 'Unable to active user. Please check your connection and try again later.');
      }
    }
  }))
);