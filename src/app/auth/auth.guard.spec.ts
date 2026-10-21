import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, authChildGuard, guestGuard } from './auth.guard';
import { AuthStore } from './store/auth.store';

/** Builds a child snapshot whose ancestor shell declares `data.roles`, the way /admin/users does. */
function childOf(shellRoles: string[] | undefined): ActivatedRouteSnapshot {
  const shell = { data: shellRoles ? { roles: shellRoles } : {} } as unknown as ActivatedRouteSnapshot;
  const child = { data: {} } as unknown as ActivatedRouteSnapshot;
  (child as any).pathFromRoot = [shell, child];
  (shell as any).pathFromRoot = [shell];
  return child;
}

function state(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('route guards', () => {
  let isLoggedIn: ReturnType<typeof signal<boolean>>;
  let role: ReturnType<typeof signal<string | null>>;
  let router: Router;

  beforeEach(() => {
    isLoggedIn = signal(false);
    role = signal<string | null>(null);
    const homeRoute = () => (role() ? `/${role()}` : '/login');
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: { isLoggedIn, role, homeRoute } }],
    });
    router = TestBed.inject(Router);
  });

  const run = (fn: typeof authGuard, route: ActivatedRouteSnapshot, url: string) =>
    TestBed.runInInjectionContext(() => fn(route, state(url))) as boolean | UrlTree;

  it('sends anonymous users to login and remembers where they were going', () => {
    const result = run(authGuard, childOf(['admin']), '/admin/users');
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fadmin%2Fusers');
  });

  it('lets a user into their own shell', () => {
    isLoggedIn.set(true);
    role.set('director');
    expect(run(authGuard, childOf(['director']), '/director/stations')).toBe(true);
  });

  it('bounces a user from another role shell to their own', () => {
    isLoggedIn.set(true);
    role.set('manager');
    const result = run(authGuard, childOf(['admin']), '/admin/users');
    expect(router.serializeUrl(result as UrlTree)).toBe('/manager');
  });

  it('checks the ancestor roles on child navigation too', () => {
    isLoggedIn.set(true);
    role.set('manager');
    const result = run(authChildGuard as unknown as typeof authGuard, childOf(['director']), '/director/managers');
    expect(router.serializeUrl(result as UrlTree)).toBe('/manager');
  });

  it('keeps signed-in users off the login page', () => {
    isLoggedIn.set(true);
    role.set('admin');
    const result = TestBed.runInInjectionContext(() => guestGuard(childOf(undefined), state('/login')));
    expect(router.serializeUrl(result as UrlTree)).toBe('/admin');
  });

  it('shows the login page to anonymous users', () => {
    expect(TestBed.runInInjectionContext(() => guestGuard(childOf(undefined), state('/login')))).toBe(true);
  });
});
