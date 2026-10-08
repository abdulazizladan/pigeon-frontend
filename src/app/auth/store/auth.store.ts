import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoginPayload, UserRole, UserSession } from '../models/auth.model';
import { decodeJwt, isJwtExpired, sessionFromJwt } from '../jwt.util';

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AuthState {
  user: UserSession | null;
  token: string | null;
  status: AuthStatus;
  errorMessage: string | null;
}

const TOKEN_STORAGE_KEY = 'access_token';

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  errorMessage: null,
};

/** Landing route for each role after login or when access is denied elsewhere. */
export function homeRouteForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'director':
      return '/director';
    case 'manager':
      return '/manager';
    default:
      return '/dashboard';
  }
}

function loginErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 401) {
      const msg = err.error?.message;
      return typeof msg === 'string' && msg && msg !== 'Invalid credentials'
        ? msg
        : 'Invalid username or password.';
    }
    if (err.status === 400) {
      const msg = err.error?.message;
      return Array.isArray(msg) ? msg.join(' ') : msg || 'Please check your input.';
    }
    if (err.status === 0) return 'Could not connect to the server.';
  }
  return 'Login failed. Please try again.';
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, token, status }) => ({
    isLoggedIn: computed(() => user() !== null && token() !== null),
    isLoading: computed(() => status() === 'loading'),
    role: computed<UserRole | null>(() => user()?.role ?? null),
    username: computed(() => user()?.username ?? ''),
    userInitial: computed(() => (user()?.username ?? 'P').charAt(0).toUpperCase()),
    homeRoute: computed(() => homeRouteForRole(user()?.role)),
    canManageUsers: computed(() => {
      const role = user()?.role;
      return role === 'admin' || role === 'director';
    }),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => {
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;

    const clearExpiryTimer = () => {
      if (expiryTimer !== null) {
        clearTimeout(expiryTimer);
        expiryTimer = null;
      }
    };

    const clearSession = () => {
      clearExpiryTimer();
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      patchState(store, { user: null, token: null });
    };

    const methods = {
      /** Accepts a token, derives the session from it, and schedules auto-logout at expiry. */
      setSession(token: string): boolean {
        const payload = decodeJwt(token);
        if (!payload || isJwtExpired(payload)) {
          clearSession();
          return false;
        }
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        patchState(store, { user: sessionFromJwt(payload), token });

        clearExpiryTimer();
        expiryTimer = setTimeout(
          () => methods.logout({ message: 'Your session has expired. Please log in again.' }),
          payload.exp * 1000 - Date.now(),
        );
        return true;
      },

      /** Restores a persisted session on startup. Does not navigate; guards handle redirects. */
      restoreSession() {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) methods.setSession(token);
      },

      login: rxMethod<LoginPayload>(
        pipe(
          tap(() => patchState(store, { status: 'loading', errorMessage: null })),
          switchMap(({ username, password, returnUrl }) =>
            authService.login({ username, password }).pipe(
              tap(({ access_token }) => {
                if (!methods.setSession(access_token)) {
                  patchState(store, {
                    status: 'error',
                    errorMessage: 'Received an invalid session token from the server.',
                  });
                  return;
                }
                patchState(store, { status: 'success' });
                router.navigateByUrl(returnUrl || store.homeRoute());
              }),
              catchError((err) => {
                patchState(store, { status: 'error', errorMessage: loginErrorMessage(err) });
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      logout(options: { redirect?: boolean; message?: string | null } = {}) {
        const { redirect = true, message = null } = options;
        clearSession();
        patchState(store, { status: 'idle', errorMessage: message });
        if (redirect) router.navigate(['/login']);
      },

      clearError() {
        patchState(store, { errorMessage: null, status: 'idle' });
      },
    };

    return methods;
  }),
  withHooks({
    onInit(store) {
      store.restoreSession();
    },
  }),
);
