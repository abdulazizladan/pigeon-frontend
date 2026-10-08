import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing-module';
import { Layout } from './components/layout/layout';
import { MyStationComponent } from './components/my-station/my-station';
import { ManagerDailySalesComponent } from './components/daily-sales/daily-sales';
import { SalesSharedModule } from '../../sales/sales-shared.module';

@NgModule({
  declarations: [Layout, MyStationComponent, ManagerDailySalesComponent],
  imports: [CommonModule, ManagerRoutingModule, SalesSharedModule],
})
export class ManagerModule {}
