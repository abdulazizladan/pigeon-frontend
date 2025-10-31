import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DispensersListComponent } from './components/dispensers-list/dispensers-list.component';
import { DispenserDetailsComponent } from './components/dispenser-details/dispenser-details.component';

const routes: Routes = [
  {
    path: '',
    component: DispensersListComponent
  },
  {
    path: ':id',
    component: DispenserDetailsComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispensersManagementRoutingModule { }
