import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './components/users-list/users-list.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent
  },
  {
    path: ':email',
    component: UserDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersManagementRoutingModule { }
