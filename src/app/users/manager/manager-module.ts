import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagerRoutingModule } from './manager-routing-module';
import { Layout } from './components/layout/layout';
import { MyStationComponent } from './components/my-station/my-station';
import { ManagerDailySalesComponent } from './components/daily-sales/daily-sales';
import { SalesSharedModule } from '../../sales/sales-shared.module';
import { MaintenanceSharedModule } from '../../maintenance/maintenance-shared.module';
import { StationsSharedModule } from '../../stations/stations-shared.module';

@NgModule({
  declarations: [Layout, MyStationComponent, ManagerDailySalesComponent],
  imports: [CommonModule, ManagerRoutingModule, SalesSharedModule, MaintenanceSharedModule, StationsSharedModule],
})
export class ManagerModule {}
