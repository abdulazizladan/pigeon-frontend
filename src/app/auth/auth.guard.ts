import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './store/auth.store';
import { UserRole } from './models/auth.model';

/**
 * Requires a logged-in user. If the route declares `data.roles`, the user's
 * role must be one of them; otherwise they are sent to their own home route.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const expectedRoles = route.data['roles'] as UserRole[] | undefined;
  if (expectedRoles?.length) {
    const role = store.role();
    if (!role || !expectedRoles.includes(role)) {
      return router.createUrlTree([store.homeRoute()]);
    }
  }

  return true;
};

/** Keeps already-authenticated users off the login page. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  return store.isLoggedIn() ? router.createUrlTree([store.homeRoute()]) : true;
};
