import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { DirectorDashboardComponent } from './components/dashboard/dashboard';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DirectorDashboardComponent },
      {
        path: 'stations',
        loadChildren: () =>
          import('../../stations/stations.module').then((m) => m.StationsModule),
      },
      {
        path: 'managers',
        loadChildren: () =>
          import('../../managers/managers.module').then((m) => m.ManagersModule),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('../../users-management/users-management.module').then(
            (m) => m.UsersManagementModule,
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DirectorRoutingModule {}
