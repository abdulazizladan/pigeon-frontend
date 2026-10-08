import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagersListComponent } from './components/managers-list/managers-list';
import { ManagerDetailsComponent } from './components/manager-details/manager-details';

const routes: Routes = [
  { path: '', component: ManagersListComponent },
  { path: ':id', component: ManagerDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagersRoutingModule {}
