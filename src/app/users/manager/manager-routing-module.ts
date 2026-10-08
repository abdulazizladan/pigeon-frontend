import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Layout } from './components/layout/layout';
import { MyStationComponent } from './components/my-station/my-station';
import { ManagerDailySalesComponent } from './components/daily-sales/daily-sales';

const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'my-station', pathMatch: 'full' },
      { path: 'my-station', component: MyStationComponent },
      { path: 'sales', component: ManagerDailySalesComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule {}
