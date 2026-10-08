import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { Layout } from './components/layout/layout';
import { AdminNavbarComponent } from './components/navbar/navbar';
import { AdminDashboardComponent } from './components/dashboard/dashboard';

@NgModule({
  declarations: [Layout, AdminNavbarComponent, AdminDashboardComponent],
  imports: [CommonModule, AdminRoutingModule],
})
export class AdminModule {}
