import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthStore } from './store/auth.store';

/**
 * Attaches the bearer token to API requests and logs the user out when the
 * backend rejects the token (401). Login requests are left untouched so a bad
 * password does not end an existing session.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isLoginRequest = isApiRequest && req.url.endsWith('/auth/login');
  const token = store.token();

  const authReq =
    isApiRequest && !isLoginRequest && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        isApiRequest &&
        !isLoginRequest &&
        store.isLoggedIn()
      ) {
        store.logout({ message: 'Your session has expired. Please log in again.' });
      }
      return throwError(() => err);
    }),
  );
};
