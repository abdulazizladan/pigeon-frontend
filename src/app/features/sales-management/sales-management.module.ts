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

import { SalesManagementRoutingModule } from './sales-management-routing.module';
import { SalesDashboardComponent } from './components/sales-dashboard/sales-dashboard.component';
import { AddSaleComponent } from './components/add-sale/add-sale.component';
import { BranchSaleComponent } from './components/branch-sale/branch-sale.component';
import { provideCharts } from 'ng2-charts';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@NgModule({
  providers: [
    provideHttpClient(),
  ],
  declarations: [
    SalesDashboardComponent,
    AddSaleComponent,
    BranchSaleComponent
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
    SalesManagementRoutingModule
  ]
})
export class SalesManagementModule { }
