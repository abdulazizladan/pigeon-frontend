import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { DirectorDashboardComponent } from './components/dashboard/dashboard';
import { RepairRequestsPageComponent } from '../../maintenance/components/repair-requests-page/repair-requests-page';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DirectorDashboardComponent },
      { path: 'repairs', component: RepairRequestsPageComponent },
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
export class DirectorRoutingModule {}
