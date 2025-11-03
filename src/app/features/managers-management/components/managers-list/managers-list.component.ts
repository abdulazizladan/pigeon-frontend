import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router'; // 👈 New Import
import { MatSort } from '@angular/material/sort';
import { ManagersStore } from '../../store/manager.store';
import { MatDialog } from '@angular/material/dialog';
import { AddManagerComponent } from '../add-manager/add-manager.component';
import { Manager } from '../../models/manager.model';

@Component({
  selector: 'app-managers-list',
  standalone: false,
  templateUrl: './managers-list.component.html',
  styleUrl: './managers-list.component.scss'
})
export class ManagersListComponent implements OnInit{

  public managersStore = inject(ManagersStore);
  private dialog = inject(MatDialog);

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar, // 👈 Inject MatSnackBar
    private router: Router,
  ) {

  }
  
  public dataSource = new MatTableDataSource<Manager>([])
  
  public displayedColumns: string[] = ["name", "email", "station", "status"]

    // ViewChilds for MatTable features
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private stationsEffect = effect(() => {
    const stations = this.managersStore.managers();
    this.dataSource = new MatTableDataSource(stations ?? []);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.dataSource.filterPredicate = (data: Manager, filter: string): boolean => {
      const dataStr = (data.info.firstName + data.info.lastName + data.email ).toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
  });

  

  ngOnInit(): void {
    this.managersStore.loadManagers()
  }

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddManagerDialog() {
    const dialogRef = this.dialog.open(AddManagerComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
        if(result) {
          this.managersStore.addManager(result);
          const snackBarRef = this.snackBar.open(
            `Manager successfully added!`,
            'Open Details', // The action button text
            {
              duration: 5000, // Duration in milliseconds (e.g., 5 seconds)
            }
          );
  
          // 3. Subscribe to the action button click
          snackBarRef.onAction().subscribe(() => {
            // Assuming the added user object has an 'id' property
            if (result.id) {
              // Navigate to the user details page, using the user's ID
              this.router.navigate([`./${result.id}`], {relativeTo: this.route}); 
            } else {
              // Handle case where user ID might be missing after creation
              console.error('Added user is missing an ID for navigation.');
            }
          });
        }
      }
    )
  }


}
