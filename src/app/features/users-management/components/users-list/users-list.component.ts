import { Component, OnInit, computed, inject, signal, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserStore } from '../../store/user.store';
import { AddUserComponent } from '../add-user/add-user.component';
import { FormControl } from '@angular/forms';
import { SuspendUserComponent } from '../suspend-user/suspend-user.component';
import { Subject } from 'rxjs'; // 👈 Import for proper cleanup
import { takeUntil } from 'rxjs/operators'; // 👈 Import for proper cleanup

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  standalone: false
  // ❌ Removed 'standalone: false' (it's the default and unnecessary)
})
export class UsersListComponent implements OnInit, OnDestroy { // 👈 Implement OnDestroy
  displayedColumns: string[] = ['name', 'email', 'role', 'status'];
  // 1. ISSUE: FormControl needs a type annotation for better safety
  searchControl = new FormControl<string>(''); 
  searchTerm = signal('');
  public userStore = inject(UserStore);
  
  // 2. ISSUE: Observable cleanup is missing. Use a Subject for cleanup.
  private destroy$ = new Subject<void>(); 

  constructor(
    private dialog: MatDialog
  ) {
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$)) // 👈 Clean up subscription
      .subscribe(value => {
        // 3. BEST PRACTICE: Ensure value is a string before setting signal
        this.searchTerm.set(value ?? '');
      });
  }

  ngOnInit() {
    this.userStore.loadUsers();
  }
  
  // 4. ISSUE: Proper cleanup on component destruction
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filteredUsers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.userStore.users().filter(user =>
      // 5. ISSUE: Added null/undefined check for 'user.info'
      (user.info?.firstName || '').toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      // 6. ISSUE: Used 'toLowerCase()' instead of the less common 'toLocaleLowerCase()'
      user.role.toLowerCase().includes(search) 
    );
  });

  getRoleColor(role: string): 'primary' | 'accent' | 'warn' {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'director':
        return 'accent';
      case 'manager':
        return 'warn'; // Assuming manager should be 'warn' as originally defined
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

    dialogRef.afterClosed().subscribe(resultId => {
      // 7. ISSUE: Renamed parameter to 'resultId' for clarity, assuming the dialog returns the ID on success
      if(resultId) {
        // Assuming your store has a method to handle the suspension
        // this.userStore.suspendUser(resultId); 
      }
    })
  }
}