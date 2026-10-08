import { Component, computed, effect, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { StationsStore } from '../../../../stations/store/stations.store';
import { StationStatus, stationStatusDescription, stationStatusLabel } from '../../../../stations/models/station.model';
import { StationEquipmentStore } from '../../../../stations/store/station-equipment.store';
import { PRODUCTS, Product, productLabel } from '../../../../stations/models/equipment.model';
import { DailySalesStore } from '../../../../sales/store/daily-sales.store';
import { CURRENCY_CODE } from '../../../../sales/models/sales.model';
import { varianceSeverity } from '../../../../sales/models/daily-sales.model';

@Component({
  selector: 'app-my-station',
  standalone: false,
  templateUrl: './my-station.html',
  styleUrl: './my-station.css',
})
export class MyStationComponent implements OnInit {
  protected readonly auth = inject(AuthStore);
  protected readonly stations = inject(StationsStore);
  protected readonly equipment = inject(StationEquipmentStore);
  protected readonly sales = inject(DailySalesStore);

  protected readonly products = PRODUCTS;
  protected readonly currencyCode = CURRENCY_CODE;
  protected readonly todayRecord = this.sales.todayRecord;

  protected readonly station = this.stations.myStation;
  protected readonly isLoading = computed(() => this.stations.myStationLoadingState() === 'loading');
  protected readonly loadError = computed(() =>
    this.stations.myStationLoadingState() === 'error' ? this.stations.myStationErrorMessage() : null,
  );
  protected readonly isUnassigned = computed(
    () => this.stations.myStationLoadingState() === 'success' && this.station() === null,
  );
  protected readonly greetingName = computed(() => this.auth.username() || 'there');

  constructor() {
    // Equipment follows whichever station turns out to be mine.
    effect(() => {
      const s = this.station();
      if (s && this.equipment.stationId() !== s.id) this.equipment.loadForStation(s.id);
    });
    this.sales.setStation(null);
    this.sales.loadRecords(this.sales.query);
  }

  ngOnInit() {
    this.stations.loadMyStation();
  }

  protected recordToday() {
    const today = this.todayRecord();
    this.sales.openRecordModal(today ? { record: today } : { stationId: null });
  }

  protected productLabel(product: Product): string {
    return productLabel(product);
  }

  protected todaySeverity(): string {
    const r = this.todayRecord();
    return r ? varianceSeverity(r.totals.varianceLitres, r.totals.expectedLitres) : 'none';
  }

  protected sign(v: number): string {
    return v > 0 ? '+' : '';
  }

  protected refresh() {
    this.stations.loadMyStation();
  }

  protected statusLabel(status: StationStatus): string {
    return stationStatusLabel(status);
  }

  protected statusDescription(status: StationStatus): string {
    return stationStatusDescription(status);
  }

  protected statusHint(status: StationStatus): string {
    switch (status) {
      case 'active': return 'Your station is open and trading normally.';
      case 'maintenance': return 'Your station is closed for works. Check with your director for the expected reopening date.';
      case 'inactive': return 'Your station is not operating at the moment. Contact your director for details.';
    }
  }
}
