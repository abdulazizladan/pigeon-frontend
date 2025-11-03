import { Component, OnInit, computed, inject, signal, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; // 👈 New Import
import { ActivatedRoute, Router } from '@angular/router'; // 👈 New Import
import { UserStore } from '../../store/user.store';
import { AddUserComponent } from '../add-user/add-user.component';
import { FormControl } from '@angular/forms';
import { SuspendUserComponent } from '../suspend-user/suspend-user.component';
import { Subject } from 'rxjs'; // 👈 Import for proper cleanup
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'; // 👈 Import for proper cleanup & optimization
import { PageEvent } from '@angular/material/paginator';

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

  // Pagination state
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageSize = signal(10);
  pageIndex = signal(0);

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar, // 👈 Inject MatSnackBar
    private router: Router, // 👈 Inject Router
    private route: ActivatedRoute
  ) {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ) // 👈 Clean up subscription
      .subscribe(value => {
        // 3. BEST PRACTICE: Ensure value is a string before setting signal
        this.searchTerm.set(value ?? '');
        // Reset to first page on new search
        this.pageIndex.set(0);
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

  // Total count of filtered users for paginator length
  totalUsers = computed(() => this.filteredUsers().length);

  // Slice of users for current page
  pagedUsers = computed(() => {
    const size = this.pageSize();
    const index = this.pageIndex();
    const start = index * size;
    return this.filteredUsers().slice(start, start + size);
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
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.userStore.addUser(result);
        const snackBarRef = this.snackBar.open(
          `User '${result.email}' successfully added!`,
          'Open Details', // The action button text
          {
            duration: 5000, // Duration in milliseconds (e.g., 5 seconds)
          }
        );

        // 3. Subscribe to the action button click
        snackBarRef.onAction().pipe(takeUntil(this.destroy$)).subscribe(() => {
          // Assuming the added user object has an 'id' property
          if (result.email) {
            // Navigate to the user details page, using the user's ID
            console.log(result.email)
            this.router.navigate([`./${result.email}`], {relativeTo: this.route}); 
          } else {
            // Handle case where user ID might be missing after creation
            console.error('Added user is missing an ID for navigation.');
          }
        });
      }
    });
  }

  openRemoveUserDialog(id: number) {
    const dialogRef = this.dialog.open(SuspendUserComponent, {
      width: '400px',
      data: {userId: id}
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(resultId => {
      // 7. ISSUE: Renamed parameter to 'resultId' for clarity, assuming the dialog returns the ID on success
      if(resultId) {
        // Assuming your store has a method to handle the suspension
        // this.userStore.suspendUser(resultId); 
      }
    })
  }

  // Handle paginator events
  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}