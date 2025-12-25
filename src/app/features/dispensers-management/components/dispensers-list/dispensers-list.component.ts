import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DispenserStore } from '../../store/dispensers.store';
import { MatDialog } from '@angular/material/dialog';
import { AddDispenserComponent } from '../add-dispenser/add-dispenser.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms'; // 👈 New Import
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'; // 👈 New Import
import { PageEvent } from '@angular/material/paginator'; // 👈 New Import
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-dispensers-list',
  standalone: false,
  templateUrl: './dispensers-list.component.html',
  styleUrl: './dispensers-list.component.scss'
})
export class DispensersListComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  public dispenserStore = inject(DispenserStore)
  displayedColumns: string[] = ['name', 'phone', 'status']

  // Search and Pagination State
  searchControl = new FormControl<string>('');
  searchTerm = signal('');
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageSize = signal(10);
  pageIndex = signal(0);


  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Search control logic
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm.set(value ?? '');
        // Reset to first page on new search
        this.pageIndex.set(0);
      });
  }

  ngOnInit() {
    this.dispenserStore.loadDispensers()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filtering Logic
  filteredDispensers = computed(() => {
    const search = this.searchTerm().toLowerCase();
    return this.dispenserStore.dispensers().filter(dispenser =>
      // Combine name and phone search
      (dispenser.firsName || '').toLowerCase().includes(search) ||
      (dispenser.lastName || '').toLowerCase().includes(search) ||
      (dispenser.middleName || '').toLowerCase().includes(search) ||
      (dispenser.phone || '').toLowerCase().includes(search)
    );
  });

  // Total count of filtered users for paginator length
  totalDispensers = computed(() => this.filteredDispensers().length);

  // Slice of users for current page
  pagedDispensers = computed(() => {
    const size = this.pageSize();
    const index = this.pageIndex();
    const start = index * size;
    return this.filteredDispensers().slice(start, start + size);
  });

  // Handle paginator events
  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  openAddDispenserDialog() {
    const dialogRef = this.dialog.open(AddDispenserComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.dispenserStore.addDispenser(result);
        const snackBarRef = this.snackBar.open(
          `Fuel attendant successfully added`,
          `View Details`, // Changed action text to match guide
          {
            duration: 5000
          }
        );
        // Navigate to details on action click
        snackBarRef.onAction().pipe(takeUntil(this.destroy$)).subscribe(() => {
          // Assuming the added dispenser object has an 'id' property
          if (result.id) {
            this.router.navigate([`./${result.id}`], { relativeTo: this.route });
          } else {
            console.error('Added attendant is missing an ID for navigation.')
          }
        })
      }
    })
  }

  toggleStatus(dispenser: any, event: MatSlideToggleChange) {
    if (!dispenser.id) return;
    const newStatus = event.checked ? 'active' : 'suspended';
    this.dispenserStore.updateStatus(dispenser.id, newStatus);
  }
}