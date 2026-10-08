import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { DirectorRoutingModule } from './director-routing-module';
import { Layout } from './components/layout/layout';
import { DirectorDashboardComponent } from './components/dashboard/dashboard';

@NgModule({
  declarations: [Layout, DirectorDashboardComponent],
  imports: [CommonModule, DirectorRoutingModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DirectorModule {}
