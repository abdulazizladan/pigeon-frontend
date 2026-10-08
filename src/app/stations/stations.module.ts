import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationsRoutingModule } from './stations-routing.module';
import { StationsListComponent } from './components/stations-list/stations-list';
import { AddStationModalComponent } from './components/add-station-modal/add-station-modal';
import { StationDetailsComponent } from './components/station-details/station-details';
import { AssignManagerModalComponent } from './components/assign-manager-modal/assign-manager-modal';
import { AddPumpModalComponent } from './components/add-pump-modal/add-pump-modal';
import { AddReservoirModalComponent } from './components/add-reservoir-modal/add-reservoir-modal';
import { SalesSharedModule } from '../sales/sales-shared.module';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@NgModule({
  declarations: [
    StationsListComponent,
    AddStationModalComponent,
    StationDetailsComponent,
    AssignManagerModalComponent,
    AddPumpModalComponent,
    AddReservoirModalComponent,
  ],
  imports: [CommonModule, StationsRoutingModule, SalesSharedModule, ConfirmDialogComponent],
})
export class StationsModule {}
