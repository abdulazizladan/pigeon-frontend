import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagersRoutingModule } from './managers-routing.module';
import { ManagersListComponent } from './components/managers-list/managers-list';
import { ManagerDetailsComponent } from './components/manager-details/manager-details';
import { AssignStationModalComponent } from './components/assign-station-modal/assign-station-modal';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@NgModule({
  declarations: [ManagersListComponent, ManagerDetailsComponent, AssignStationModalComponent],
  imports: [CommonModule, ManagersRoutingModule, ConfirmDialogComponent],
})
export class ManagersModule {}
