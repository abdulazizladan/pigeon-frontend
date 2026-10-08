import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { UsersManagementService } from '../services/users-management.service';
import { User, CreateUserPayload, fullName } from '../models/user.model';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UsersState {
  users: User[];
  selectedUser: User | null;
  searchQuery: string;
  loadingState: LoadingState;
  createLoadingState: LoadingState;
  errorMessage: string | null;
  createErrorMessage: string | null;
  isAddUserModalOpen: boolean;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  searchQuery: '',
  loadingState: 'idle',
  createLoadingState: 'idle',
  errorMessage: null,
  createErrorMessage: null,
  isAddUserModalOpen: false,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ users, searchQuery }) => ({
    filteredUsers: computed(() => {
      const q = searchQuery().toLowerCase().trim();
      if (!q) return users();
      return users().filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          fullName(u).toLowerCase().includes(q) ||
          (u.phoneNumber ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
          u.role.toLowerCase().includes(q),
      );
    }),
    totalCount: computed(() => users().length),
    roleCounts: computed(() => {
      const counts = { admin: 0, director: 0, manager: 0 };
      for (const u of users()) counts[u.role]++;
      return counts;
    }),
  })),
  withMethods((store, service = inject(UsersManagementService)) => ({
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },

    openAddUserModal() {
      patchState(store, { isAddUserModalOpen: true, createErrorMessage: null, createLoadingState: 'idle' });
    },

    closeAddUserModal() {
      patchState(store, { isAddUserModalOpen: false, createErrorMessage: null, createLoadingState: 'idle' });
    },

    resetCreateState() {
      patchState(store, { createLoadingState: 'idle', createErrorMessage: null });
    },

    selectUser(user: User | null) {
      patchState(store, { selectedUser: user });
    },

    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loadingState: 'loading', errorMessage: null })),
        switchMap(() =>
          service.getUsers().pipe(
            tap((users) => patchState(store, { users, loadingState: 'success' })),
            catchError((err) => {
              const msg = err?.error?.message ?? 'Failed to load users.';
              patchState(store, { loadingState: 'error', errorMessage: msg });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    createUser: rxMethod<CreateUserPayload>(
      pipe(
        tap(() => patchState(store, { createLoadingState: 'loading', createErrorMessage: null })),
        switchMap((payload) =>
          service.createUser(payload).pipe(
            tap((newUser) => {
              patchState(store, (state) => ({
                users: [...state.users, newUser],
                createLoadingState: 'success' as LoadingState,
                isAddUserModalOpen: false,
              }));
            }),
            catchError((err) => {
              let msg = 'An error occurred. Please try again.';
              if (err.status === 409) msg = 'Username already exists.';
              else if (err.status === 403) msg = 'Insufficient permissions to create this role.';
              else if (err.status === 400) {
                const m = err?.error?.message;
                msg = Array.isArray(m) ? m.join(' ') : m ?? msg;
              }
              patchState(store, { createLoadingState: 'error', createErrorMessage: msg });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
