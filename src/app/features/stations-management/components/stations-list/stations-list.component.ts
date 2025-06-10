import { Component, inject, OnInit } from '@angular/core';
import { StationsStore } from '../../store/stations.store';
import { MatDialog } from '@angular/material/dialog';
import { AddStationComponent } from '../add-station/add-station.component';

@Component({
  selector: 'app-stations-list',
  standalone: false,
  templateUrl: './stations-list.component.html',
  styleUrl: './stations-list.component.scss'
})
export class StationsListComponent implements OnInit {

  public displayedColumns: string[] = ['name', 'location', 'actions'];
  public stationsStore = inject(StationsStore);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.stationsStore.loadStations();
  }

  openAddStationDialog() {
    const dialogRef = this.dialog.open(AddStationComponent, {
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.stationsStore.addStation(result)
      }
    })
  }

}
