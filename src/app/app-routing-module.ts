import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { authGuard, guestGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'users-management',
    loadChildren: () =>
      import('./users-management/users-management.module').then(
        (m) => m.UsersManagementModule,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./users/admin/admin-module').then((m) => m.AdminModule),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'director',
    loadChildren: () =>
      import('./users/director/director-module').then((m) => m.DirectorModule),
    canActivate: [authGuard],
    data: { roles: ['director'] },
  },
  {
    path: 'manager',
    loadChildren: () =>
      import('./users/manager/manager-module').then((m) => m.ManagerModule),
    canActivate: [authGuard],
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
