import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UsersManagementRoutingModule } from './users-management-routing.module';
import { UsersListComponent } from './components/users-list/users-list';
import { UserDetailsComponent } from './components/user-details/user-details';
import { AddUserModalComponent } from './components/add-user-modal/add-user-modal';

@NgModule({
  declarations: [
    UsersListComponent,
    UserDetailsComponent,
    AddUserModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    UsersManagementRoutingModule,
  ],
})
export class UsersManagementModule {}
