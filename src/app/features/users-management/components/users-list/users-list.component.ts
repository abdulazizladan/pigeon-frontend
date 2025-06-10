import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserStore } from '../../store/user.store';
import { AddUserComponent } from '../add-user/add-user.component';
import { FormControl } from '@angular/forms';
import { SuspendUserComponent } from '../suspend-user/suspend-user.component';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: 'users-list.component.html',
  styleUrl: 'users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'role', 'status'];
  searchControl = new FormControl('');
  searchTerm = signal('');
  public userStore = inject(UserStore)
  constructor(
    private dialog: MatDialog
  ) {
    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm.set(value || '');
    });
  }

  ngOnInit() {
    this.userStore.loadUsers();
  }

  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.userStore.users().filter(user =>
      user.info.firstName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLocaleLowerCase().includes(search)
    );
  });

  getRoleColor(role: string): 'primary' | 'accent' | 'warn' {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'director':
        return 'accent';
      case 'manager':
        return 'warn';
      default:
        return 'primary';
    }
  }

  openAddUserDialog() {
    const dialogRef = this.dialog.open(AddUserComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userStore.addUser(result);
      }
    });
  }

  openRemoveUserDialog(id: number) {
    const dialogRef = this.dialog.open(SuspendUserComponent, {
      width: '400px',
      data: {userId: id}
    });

    dialogRef.afterClosed().subscribe(id => {
      if(id) {
        //this.userStore.suspendUser(id)
      }
    })
  }
}
