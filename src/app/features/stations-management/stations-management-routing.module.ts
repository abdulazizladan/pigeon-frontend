import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StationsListComponent } from './components/stations-list/stations-list.component';
import { StationDetailsComponent } from './components/station-details/station-details.component';

const routes: Routes = [
  {
    path: '',
    component: StationsListComponent,
  },
  {
    path: ':id',
    component: StationDetailsComponent
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
export class StationsManagementRoutingModule { }
