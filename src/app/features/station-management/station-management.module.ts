import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
import { MatListModule } from '@angular/material/list';

import { StationManagementRoutingModule } from './station-management-routing.module';
import { StationDetailsComponent } from './components/station-details/station-details.component';
import { PumpDetailsComponent } from './components/pump-details/pump-details.component';


@NgModule({
  declarations: [
    StationDetailsComponent,
    PumpDetailsComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
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
    MatListModule,
    StationManagementRoutingModule
  ]
})
export class StationManagementModule { }
