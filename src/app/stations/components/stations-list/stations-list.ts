import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StationsStore } from '../../store/stations.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { Station, StationStatus, stationLocation, stationStatusLabel } from '../../models/station.model';

@Component({
  selector: 'app-stations-list',
  standalone: false,
  templateUrl: './stations-list.html',
  styleUrl: './stations-list.css',
})
export class StationsListComponent implements OnInit {
  protected readonly store = inject(StationsStore);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly canManage = this.auth.canManageUsers;

  ngOnInit() {
    this.store.loadStations();
  }

  protected onSearch(event: Event) {
    this.store.setSearchQuery((event.target as HTMLInputElement).value);
  }

  protected openAddStation() {
    this.store.openAddStationModal();
  }

  protected viewStation(id: string) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  protected statusLabel(status: StationStatus): string {
    return stationStatusLabel(status);
  }

  protected location(station: Station): string {
    return stationLocation(station) || '—';
  }

  protected trackById(_: number, station: Station): string {
    return station.id;
  }
}
