import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { AdminDashboardComponent } from './components/dashboard/dashboard';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      {
        path: 'users',
        loadChildren: () =>
          import('../../users-management/users-management.module').then(
            (m) => m.UsersManagementModule,
          ),
      },
      {
        path: 'managers',
        loadChildren: () =>
          import('../../managers/managers.module').then((m) => m.ManagersModule),
      },
      {
        path: 'stations',
        loadChildren: () =>
          import('../../stations/stations.module').then((m) => m.StationsModule),
      },
      {
        path: 'tickets',
        loadChildren: () =>
          import('../../tickets/tickets.module').then((m) => m.TicketsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
