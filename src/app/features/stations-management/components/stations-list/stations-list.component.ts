import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { StationStore } from '../../store/stations.store'; // Corrected import path/name
import { MatDialog } from '@angular/material/dialog';
import { Station } from '../../models/station.model';
import { AddStationComponent } from '../add-station/add-station.component'; 

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
  
  // Data source for the mat-table, must be a MatTableDataSource for filtering
  public dataSource = new MatTableDataSource<Station>([]);

  public displayedColumns: string[] = ['name', 'location', 'pumps', 'status', 'actions'];

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
       if(result) {
         this.stationStore.createStation(result) // Assuming addStation exists on the store
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
}
