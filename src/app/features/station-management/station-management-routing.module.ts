import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StationDetailsComponent } from './components/station-details/station-details.component';
import { PumpDetailsComponent } from './components/pump-details/pump-details.component';

const routes: Routes = [
  {
    path: '',
    component: StationDetailsComponent
  },
  {
    path: 'pump/:id',
    component: PumpDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StationManagementRoutingModule { }
