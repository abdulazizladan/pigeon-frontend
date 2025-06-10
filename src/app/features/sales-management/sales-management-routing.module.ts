import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesDashboardComponent } from './components/sales-dashboard/sales-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: SalesDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesManagementRoutingModule { }
