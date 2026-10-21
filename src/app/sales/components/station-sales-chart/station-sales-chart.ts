import { Component, computed, effect, inject, input } from '@angular/core';
import type { Plugin } from 'chart.js';
import { ThemeService } from '../../../theme.service';
import { StationSalesStore } from '../../store/station-sales.store';
import { CURRENCY_CODE, RANGE_PRESETS, RangePreset, formatLocalDate, formatLongDate } from '../../models/sales.model';
import { buildSalesChartData, buildSalesChartOptions, crosshairPlugin, salesChartColors } from '../../chart/sales-chart';

/**
 * Daily sales line for one station with a period filter. Pass `stationId` null for the
 * signed-in manager's own station (the API resolves it).
 */
@Component({
  selector: 'app-station-sales-chart',
  standalone: false,
  templateUrl: './station-sales-chart.html',
  styleUrl: './station-sales-chart.css',
  providers: [StationSalesStore],
})
export class StationSalesChartComponent {
  readonly stationId = input<string | null>(null);
  readonly title = input('Sales performance');

  protected readonly store = inject(StationSalesStore);
  private readonly themeService = inject(ThemeService);

  protected readonly presets = RANGE_PRESETS;
  protected readonly currencyCode = CURRENCY_CODE;
  protected readonly today = formatLocalDate(new Date());
  protected readonly summary = this.store.summary;

  protected readonly rangeLabel = computed(() => {
    const { from, to } = this.store.range();
    return `${formatLongDate(from)} – ${formatLongDate(to)}`;
  });

  protected readonly peakDay = computed(() => {
    const points = this.summary()?.points ?? [];
    if (!points.length) return null;
    return points.reduce((best, p) => (p.amount > best.amount ? p : best), points[0]);
  });

  private readonly colors = computed(() => salesChartColors(this.themeService.theme()));
  protected readonly chartData = computed(() => buildSalesChartData(this.summary()?.points ?? [], this.colors()));
  protected readonly chartOptions = computed(() => buildSalesChartOptions(this.summary()?.points ?? [], this.colors()));
  protected readonly chartPlugins: Plugin<'line'>[] = [crosshairPlugin(() => this.colors().axis)];

  constructor() {
    effect(() => this.store.setStation(this.stationId()));
    this.store.loadSummary(this.store.query);
  }

  protected setPreset(preset: RangePreset) {
    this.store.setPreset(preset);
  }

  protected onCustomFrom(event: Event) {
    const from = (event.target as HTMLInputElement).value;
    if (from) this.store.setCustomRange(from, this.store.customTo());
  }

  protected onCustomTo(event: Event) {
    const to = (event.target as HTMLInputElement).value;
    if (to) this.store.setCustomRange(this.store.customFrom(), to);
  }

  protected retry() {
    this.store.loadSummary(this.store.query());
  }

  protected day(iso: string): string {
    return formatLongDate(iso);
  }
}
