import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

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
import { provideCharts } from 'ng2-charts';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { BaseChartDirective } from 'ng2-charts';

import { SalesRecordsManaementRoutingModule } from './sales-records-manaement-routing-module';
import { Summary } from './components/summary/summary';
import { Export } from './components/export/export';



@NgModule({
  providers: [
    provideHttpClient(),
  ],
  declarations: [
    Summary,
    Export
  ],
  imports: [
    CommonModule,
     ReactiveFormsModule,
    FlexLayoutModule,
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
    MatSnackBarModule,
    BaseChartDirective,
    SalesRecordsManaementRoutingModule
  ]
})
export class SalesRecordsManaementModule { }
