import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthStore } from './store/auth.store';
import { UserRole } from './models/auth.model';

/** Roles required by a route: the `data.roles` of the route itself or the nearest ancestor that sets one. */
function requiredRoles(route: ActivatedRouteSnapshot): UserRole[] | null {
  for (let i = route.pathFromRoot.length - 1; i >= 0; i--) {
    const roles = route.pathFromRoot[i].data?.['roles'] as UserRole[] | undefined;
    if (roles?.length) return roles;
  }
  return null;
}

function checkAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  const store = inject(AuthStore);
  const router = inject(Router);

  if (!store.isLoggedIn()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const roles = requiredRoles(route);
  if (roles) {
    const role = store.role();
    if (!role || !roles.includes(role)) {
      return router.createUrlTree([store.homeRoute()]);
    }
  }

  return true;
}

/**
 * Requires a signed-in user whose role matches the route's (or an ancestor's) `data.roles`.
 * Use it as both `canActivate` and `canActivateChild` on a role shell so every page inside it,
 * including lazily loaded children, is checked on direct navigation and deep links.
 */
export const authGuard: CanActivateFn = (route, state) => checkAccess(route, state);
export const authChildGuard: CanActivateChildFn = (childRoute, state) => checkAccess(childRoute, state);

/** Keeps already-authenticated users off the login page by sending them to their own shell. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  return store.isLoggedIn() ? router.createUrlTree([store.homeRoute()]) : true;
};
