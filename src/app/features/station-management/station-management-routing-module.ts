import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyStation } from './components/my-station/my-station';

const routes: Routes = [
  {
    path: '',
    component: MyStation
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StationManagementRoutingModule { }
