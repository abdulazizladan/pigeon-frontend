import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { UserService } from '../services/users.service';
import { User } from '../models/user.model';
import { UserDetail } from '../models/user-detail.model';

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

export const UserStore = signalStore(

  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, userService = inject(UserService)) => ({
    async loadUsers() {
      patchState(store, { loading: true, error: null });
      try {
        const users = await userService.getUsers();
        patchState(store, { users, loading: false });
      } catch (error) {
        console.error('Error loading users: ', error);
        patchState(store, {
          error: 'Failed to load users. Please try again later.',
          loading: false
        });
      }
    },
    async selectUser(email: string) {
      patchState(store, { loading: true, error: null });
      try {
        const user = await userService.getUserByEmail(email);
        patchState(store, { selectedUser: user, loading: false });
      } catch (error) {
        console.log('Error selecting user: ', error);
        patchState(store, {
          error: 'Failed to load user. Please try again later.',
          loading: false
        });
      }
    },
    async addUser(user: User) {
      patchState(store, { loading: true, error: null });
      try {
        const newUser = await userService.createUser(user);
        patchState(store, state => ({
          users: [...state.users, user],
          loading: false,
          error: null
        }));
      } catch (error) {
        patchState(store, {
          error: 'Failed to create user. Please try again later.',
          loading: false
        });
      }
    },
    async updateUser(user: User) {
      patchState(store, { loading: true, error: null });
      try {
        const updatedUser = await userService.updateUser(user);
        /**const updatedUsers = store.users.map((u: { id: number; }) => {
          if (u.id === user.id) {
            return updatedUser;
          }
          return u;
        });**/
        //patchState(store, { user: updatedUser, loading: false, error: null });
      } catch (error) {
        patchState(store, {
          error: 'Failed to update user. Please try again later.',
          loading: false
        });
      }
    },
    /**async suspendUser(id: number) {
      patchState(store, {loading: true, error: null})
      try {
        const user = await userService.suspendUser(id);
        const updatedUsers = store.users.map((user: { id: number; }) => {
          if (user.id === id) {
            return {
              ...user,
              status: 'suspended'
            };
          }
          return user;
        });
        patchState(store, {users: updatedUsers});
        patchState(store, {loading: false, error: null})
      } catch(error) {
        patchState(store, {loading: false, error: "Unable to suspend user. Please check your connection and try again later."})
      }
    }**/
  }))
);
