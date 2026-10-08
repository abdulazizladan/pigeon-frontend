import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StationsListComponent } from './components/stations-list/stations-list';
import { StationDetailsComponent } from './components/station-details/station-details';

const routes: Routes = [
  { path: '', component: StationsListComponent },
  { path: ':id', component: StationDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StationsRoutingModule {}
