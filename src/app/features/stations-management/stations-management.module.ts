import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';

import { StationsManagementRoutingModule } from './stations-management-routing.module';
import { StationsListComponent } from './components/stations-list/stations-list.component';
import { StationDetailsComponent } from './components/station-details/station-details.component';
import { AddStationComponent } from './components/add-station/add-station.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AssignManager } from './components/assign-manager/assign-manager';
import { UnassignManager } from './components/unassign-manager/unassign-manager';


@NgModule({
  providers: [
    provideHttpClient()
  ],
  declarations: [
    StationsListComponent,
    StationDetailsComponent,
    AddStationComponent,
    AssignManager,
    UnassignManager
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatSelectModule,
    MatMenuModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    StationsManagementRoutingModule
  ]
})
export class StationsManagementModule { }
