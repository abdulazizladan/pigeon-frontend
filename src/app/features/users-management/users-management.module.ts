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

import { UsersManagementRoutingModule } from './users-management-routing.module';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { SuspendUserComponent } from './components/suspend-user/suspend-user.component';
import { DeativateUserDialogComponent } from './components/deativate-user-dialog/deativate-user-dialog.component';


@NgModule({
  declarations: [
    UsersListComponent,
    UserDetailsComponent,
    AddUserComponent,
    SuspendUserComponent,
    DeativateUserDialogComponent
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
    UsersManagementRoutingModule
  ]
})
export class UsersManagementModule { }
