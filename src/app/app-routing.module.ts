import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/guard/auth.guard';
import { RoleGuard } from './auth/guard/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: './auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./users/admin/admin.module').then(module => module.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin'}
  },
  {
    path: 'director',
    loadChildren: () => import('./users/director/director.module').then(module => module.DirectorModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'director'}
  },
  {
    path: 'manager',
    loadChildren: () => import('./users/manager/manager.module').then(module => module.ManagerModule),
    canActivate: [AuthGuard, RoleGuard],
    data: {role: 'manager'}
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
