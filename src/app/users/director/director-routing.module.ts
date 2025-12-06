import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      {
        path: "",
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'stations',
        loadChildren: () => import('../../features/stations-management/stations-management.module').then(module => module.StationsManagementModule)
      },
      {
        path: 'sales',
        loadChildren: () => import('../../features/sales-records-manaement/sales-records-manaement-module').then(module => module.SalesRecordsManaementModule)
      },
      {
        path: 'managers',
        loadChildren: () => import('../../features/managers-management/managers-management.module').then(module => module.ManagersManagementModule)
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
export class DirectorRoutingModule { }
