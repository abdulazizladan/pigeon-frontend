import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagersListComponent } from './components/managers-list/managers-list.component';
import { ManagerDetailsComponent } from './components/manager-details/manager-details.component';

const routes: Routes = [
  {
    path: '',
    component: ManagersListComponent
  },
  {
    path: ':id',
    component: ManagerDetailsComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagersManagementRoutingModule { }
