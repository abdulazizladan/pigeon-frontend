import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Layout } from './components/layout/layout';
import { AdminNavbarComponent } from './components/navbar/navbar';
import { AdminDashboardComponent } from './components/dashboard/dashboard';
import { MaintenanceSharedModule } from '../../maintenance/maintenance-shared.module';

@NgModule({
  declarations: [Layout, AdminNavbarComponent, AdminDashboardComponent],
  imports: [CommonModule, AdminRoutingModule, MaintenanceSharedModule],
})
export class AdminModule {}
