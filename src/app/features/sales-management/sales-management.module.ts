import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
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
import { MatSelect } from '@angular/material/select';

import { SalesManagementRoutingModule } from './sales-management-routing.module';
import { SalesDashboardComponent } from './components/sales-dashboard/sales-dashboard.component';
import { AddSaleComponent } from './components/add-sale/add-sale.component';
import { BranchSaleComponent } from './components/branch-sale/branch-sale.component';


@NgModule({
  declarations: [
    SalesDashboardComponent,
    AddSaleComponent,
    BranchSaleComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
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
    MatSelect,
    SalesManagementRoutingModule
  ]
})
export class SalesManagementModule { }
