import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { LoginData } from '../models/loginData.model';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userRole: string | null;
  userEmail: string| null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  userRole: null,
  userEmail: null,
  loading: false,
  error: null
};


export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    async login(data: LoginData) {
      patchState(store, { loading: true, error: null });
      try {
        const response = await authService.login(data);
        const decodedToken = jwtDecode(response) as any;

        patchState(store, {
          token: response,
          isAuthenticated: true,
          userRole: decodedToken.role,
          userEmail: decodedToken.email,
          error: null,
        });

        // Redirect based on role
        switch (decodedToken.role) {
          case 'admin':
            router.navigate(['/admin']);
            break;
          case 'director':
            router.navigate(['/director']);
            break;
          case 'manager':
            router.navigate(['/manager']);
            break;
          default:
            router.navigate(['/']);
        }
      } catch (error) {
        patchState(store, {
          error: 'Login failed. Please try again.',
          loading: false
        });
      }
    },

    logout() {
      localStorage.removeItem('auth_token');
      patchState(store, {loading: false, error: null, isAuthenticated: false, token: null, userRole: null, userEmail: null});
      router.navigate(['/auth/login']);
    }
  }))
);






