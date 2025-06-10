import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';

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
        path: 'users',
        loadChildren: () => import('../../features/users-management/users-management.module').then(module => module.UsersManagementModule)
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
export class AdminRoutingModule { }
