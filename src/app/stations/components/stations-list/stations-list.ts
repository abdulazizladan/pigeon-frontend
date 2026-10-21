import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StationsStore } from '../../store/stations.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { Station, StationStatus, stationLocation, stationStatusLabel } from '../../models/station.model';
import { LevelBand, Product, ReservoirLevelIndicator, levelBand, levelBandLabel, productLabel } from '../../models/equipment.model';

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
    this.store.loadAllLevels();
  }

  protected levelsFor(station: Station): ReservoirLevelIndicator[] {
    return this.store.levelsByStation()[station.id] ?? [];
  }

  protected band(r: ReservoirLevelIndicator): LevelBand {
    return levelBand(r.percent);
  }

  protected levelTitle(r: ReservoirLevelIndicator): string {
    const pct = r.percent !== null ? `${Math.round(r.percent)}%` : 'no reading';
    const litres = r.level !== null ? ` · ${Math.round(r.level).toLocaleString()} of ${Math.round(r.capacityLitres).toLocaleString()} L` : '';
    return `${productLabel(r.product)}: ${pct} (${levelBandLabel(levelBand(r.percent))})${litres}`;
  }

  protected productLabel(p: Product): string {
    return productLabel(p);
  }

  protected trackReservoir(_: number, r: ReservoirLevelIndicator): string {
    return r.reservoirId;
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
