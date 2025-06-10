import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'dispensers',
        loadChildren: () => import('../../features/dispensers-management/dispensers-management.module').then(module => module.DispensersManagementModule)
      },
      {
        path: 'station',
        loadChildren: () => import('../../features/station-management/station-management.module').then(module => module.StationManagementModule)
      },
      {
        path: 'sales',
        loadChildren: () => import('../../features/sales-management/sales-management.module').then(module => module.SalesManagementModule)
      },
      {
        path: 'issues',
        loadChildren: () => import('../../features/tickets-management/tickets-management.module').then(module => module.TicketsManagementModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagerRoutingModule { }
