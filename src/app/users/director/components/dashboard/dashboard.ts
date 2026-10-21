import { Component, computed, inject, OnInit, signal } from '@angular/core';
import type { Plugin } from 'chart.js';
import { AuthStore } from '../../../../auth/store/auth.store';
import { ThemeService } from '../../../../theme.service';
import { StationsStore } from '../../../../stations/store/stations.store';
import { SalesStore, ALL_STATIONS } from '../../../../sales/store/sales.store';
import { RepairRequestsStore } from '../../../../maintenance/store/repair-requests.store';
import { RANGE_PRESETS, RangePreset, CURRENCY_CODE, formatLongDate } from '../../../../sales/models/sales.model';

import { buildSalesChartData, buildSalesChartOptions, crosshairPlugin, salesChartColors } from '../../../../sales/chart/sales-chart';

@Component({
  selector: 'app-director-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DirectorDashboardComponent implements OnInit {
  protected readonly auth = inject(AuthStore);
  protected readonly stations = inject(StationsStore);
  protected readonly sales = inject(SalesStore);
  protected readonly repairs = inject(RepairRequestsStore);
  private readonly themeService = inject(ThemeService);

  protected readonly presets = RANGE_PRESETS;
  protected readonly allStations = ALL_STATIONS;
  protected readonly currencyCode = CURRENCY_CODE;
  protected readonly showTable = signal(false);

  protected readonly greetingName = computed(() => this.auth.username() || 'Director');
  protected readonly stats = this.stations.stats;
  protected readonly summary = this.sales.summary;

  protected readonly selectedStationName = computed(() => {
    const id = this.sales.stationId();
    if (id === ALL_STATIONS) return 'All stations';
    return this.stations.stations().find((s) => s.id === id)?.name ?? 'Selected station';
  });

  protected readonly rangeLabel = computed(() => {
    const { from, to } = this.sales.range();
    return `${formatLongDate(from)} – ${formatLongDate(to)}`;
  });

  protected readonly peakDay = computed(() => {
    const points = this.summary()?.points ?? [];
    if (points.length === 0) return null;
    return points.reduce((best, p) => (p.amount > best.amount ? p : best), points[0]);
  });

  private readonly chartColors = computed(() => salesChartColors(this.themeService.theme()));
  protected readonly chartData = computed(() => buildSalesChartData(this.summary()?.points ?? [], this.chartColors()));
  protected readonly chartOptions = computed(() => buildSalesChartOptions(this.summary()?.points ?? [], this.chartColors()));
  protected readonly chartPlugins: Plugin<'line'>[] = [crosshairPlugin(() => this.chartColors().axis)];

  constructor() {
    // Re-fetches automatically whenever the date range or station filter changes.
    this.sales.loadSummary(this.sales.query);
  }

  ngOnInit() {
    this.stations.loadStations();
    this.stations.loadStats();
    this.repairs.loadStats(null);
  }

  protected setPreset(preset: RangePreset) {
    this.sales.setPreset(preset);
  }

  protected onCustomFrom(event: Event) {
    const from = (event.target as HTMLInputElement).value;
    if (from) this.sales.setCustomRange(from, this.sales.customTo());
  }

  protected onCustomTo(event: Event) {
    const to = (event.target as HTMLInputElement).value;
    if (to) this.sales.setCustomRange(this.sales.customFrom(), to);
  }

  protected onStationChange(event: Event) {
    this.sales.setStation((event.target as HTMLSelectElement).value);
  }

  protected toggleTable() {
    this.showTable.update((v) => !v);
  }

  protected formatDay(isoDay: string): string {
    return formatLongDate(isoDay);
  }
}
