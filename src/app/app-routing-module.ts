import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { authGuard, authChildGuard, guestGuard } from './auth/auth.guard';

/**
 * Every signed-in user lives inside the shell for their role. There is no shared landing
 * page: `/` and unknown paths go to `/login`, whose guard forwards signed-in users to
 * their own shell.
 */
const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'admin',
    loadChildren: () => import('./users/admin/admin-module').then((m) => m.AdminModule),
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'director',
    loadChildren: () => import('./users/director/director-module').then((m) => m.DirectorModule),
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    data: { roles: ['director'] },
  },
  {
    path: 'manager',
    loadChildren: () => import('./users/manager/manager-module').then((m) => m.ManagerModule),
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    data: { roles: ['manager'] },
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
