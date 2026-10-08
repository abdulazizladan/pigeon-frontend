import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListComponent } from './components/users-list/users-list';
import { UserDetailsComponent } from './components/user-details/user-details';

const routes: Routes = [
  {
    path: '',
    component: UsersListComponent,
  },
  {
    path: ':id',
    component: UserDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersManagementRoutingModule {}
