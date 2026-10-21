import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthCheckModalComponent } from './components/health-check-modal/health-check-modal';
import { StationHealthComponent } from './components/station-health/station-health';
import { RepairRequestModalComponent } from './components/repair-request-modal/repair-request-modal';
import { RepairDecisionModalComponent } from './components/repair-decision-modal/repair-decision-modal';
import { RepairRequestsListComponent } from './components/repair-requests-list/repair-requests-list';
import { StationHealthPageComponent } from './components/station-health-page/station-health-page';
import { RepairRequestsPageComponent } from './components/repair-requests-page/repair-requests-page';

const COMPONENTS = [
  HealthCheckModalComponent,
  StationHealthComponent,
  RepairRequestModalComponent,
  RepairDecisionModalComponent,
  RepairRequestsListComponent,
  StationHealthPageComponent,
  RepairRequestsPageComponent,
];

/** Station health checks and repair requests, shared by the manager, director, admin and station pages. */
@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule],
  exports: COMPONENTS,
})
export class MaintenanceSharedModule {}
