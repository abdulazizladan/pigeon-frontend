import { Component, effect, inject, OnInit, ViewChild, computed } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StationStore } from '../../store/stations.store'; // Corrected import path/name
import { MatDialog } from '@angular/material/dialog';
import { Station } from '../../models/station.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddStationComponent } from '../add-station/add-station.component';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-stations-list',
  standalone: false,
  templateUrl: './stations-list.component.html',
  styleUrl: './stations-list.component.scss'
})
export class StationsListComponent implements OnInit {

  // Use the correct store name/path
  public stationStore = inject(StationStore);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private destroy$ = new Subject<void>();

  // --- Computed Statistics ---
  public totalStations = computed(() => this.stationStore.stations()?.length || 0);

  public activeStations = computed(() => {
    const stations = this.stationStore.stations();
    return stations ? stations.filter(s => s.status === 'active').length : 0;
  });

  public suspendedStations = computed(() => {
    const stations = this.stationStore.stations();
    return stations ? stations.filter(s => s.status !== 'active').length : 0;
  });


  // Data source for the mat-table, must be a MatTableDataSource for filtering
  public dataSource = new MatTableDataSource<Station>([]);
  private snackbar = inject(MatSnackBar);

  public displayedColumns: string[] = ['name', 'location', 'pumps', 'status', 'toggle', 'actions'];

  // ViewChilds for MatTable features
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Create the effect in a field initializer to ensure a valid injection context
  private stationsEffect = effect(() => {
    const stations = this.stationStore.stations();
    this.dataSource = new MatTableDataSource(stations ?? []);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    this.dataSource.filterPredicate = (data: Station, filter: string): boolean => {
      const dataStr = (data.name + data.address + data.lga + data.state).toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
  });


  ngOnInit(): void {
    // 1. Load the list of stations
    this.stationStore.loadStations();
    this.stationStore.loadManagers();
  }

  /**
   * Applies the value from the search input to the MatTableDataSource filter.
   * @param event The input event from the search field.
   */
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Placeholder function for the 'Add Station' button
  public openAddStationDialog() {
    const dialogRef = this.dialog.open(AddStationComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.stationStore.createStation(result);
        const snackBarRef = this.snackbar.open(
          `New station added successfully`,
          `OpenDetails`,
          {
            duration: 5000
          }
        );
        snackBarRef.onAction().pipe(takeUntil(this.destroy$)).subscribe(() => {
          if (result) {
            this.router.navigate([`./${this.stationStore.lastAddedId()}`], { relativeTo: this.route })
          } else {
            console.error(`Added station is missing an ID for navigation`)
          }
        })
      }
    });
  }

  /**
   * Placeholder function to navigate/select a station.
   * In a real app, this would use the router (e.g., router.navigate(['/stations', stationId]))
   */
  public viewStationDetails(stationId: string | null) {
    if (stationId) {
      console.log(`Navigating to station details for ID: ${stationId}`);
      this.stationStore.loadSelectedStation(stationId);
      // TODO: Implement navigation away from this list view
    }
  }

  public toggleStatus(station: Station, event: MatSlideToggleChange) {
    if (!station.id) {
      console.error('Station ID is missing');
      return;
    }
    const newStatus = event.checked ? 'active' : 'suspended';
    this.stationStore.updateStationStatus(station.id, newStatus);
  }
}
