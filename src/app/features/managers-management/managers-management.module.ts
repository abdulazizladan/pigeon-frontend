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

import { ManagersManagementRoutingModule } from './managers-management-routing.module';
import { ManagersListComponent } from './components/managers-list/managers-list.component';
import { ManagerDetailsComponent } from './components/manager-details/manager-details.component';
import { AddManagerComponent } from './components/add-manager/add-manager.component';


@NgModule({
  declarations: [
    ManagersListComponent,
    ManagerDetailsComponent,
    AddManagerComponent
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
    ManagersManagementRoutingModule
  ]
})
export class ManagersManagementModule { }
