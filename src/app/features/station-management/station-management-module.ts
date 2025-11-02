import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { StationManagementRoutingModule } from './station-management-routing-module';
import { MyStation } from './components/my-station/my-station';


@NgModule({
  providers: [
    provideHttpClient()
  ],
  declarations: [
    MyStation
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    StationManagementRoutingModule
  ]
})
export class StationManagementModule { }
