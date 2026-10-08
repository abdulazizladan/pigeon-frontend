import { Component, computed, inject, OnInit, signal } from '@angular/core';
import type { ChartConfiguration, ChartData, Plugin, TooltipItem } from 'chart.js';
import { AuthStore } from '../../../../auth/store/auth.store';
import { ThemeService } from '../../../../theme.service';
import { StationsStore } from '../../../../stations/store/stations.store';
import { SalesStore, ALL_STATIONS } from '../../../../sales/store/sales.store';
import {
  RANGE_PRESETS,
  RangePreset,
  CURRENCY_CODE,
  formatCompactCurrency,
  formatCurrency,
  formatLongDate,
  formatShortDate,
} from '../../../../sales/models/sales.model';

interface ChartColors {
  series: string;
  seriesWash: string;
  surface: string;
  grid: string;
  axis: string;
  muted: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
}

// Validated single-series colours (dataviz validator, both modes pass on the card surfaces).
const LIGHT: ChartColors = {
  series: '#1877F2',
  seriesWash: 'rgba(24, 119, 242, 0.10)',
  surface: '#FFFFFF',
  grid: 'rgba(0, 0, 0, 0.08)',
  axis: '#CED0D4',
  muted: '#65676B',
  tooltipBg: '#FFFFFF',
  tooltipText: '#050505',
  tooltipBorder: '#CED0D4',
};

const DARK: ChartColors = {
  series: '#3987E5',
  seriesWash: 'rgba(57, 135, 229, 0.12)',
  surface: '#242526',
  grid: 'rgba(255, 255, 255, 0.08)',
  axis: '#3E4042',
  muted: '#B0B3B8',
  tooltipBg: '#242526',
  tooltipText: '#E4E6EB',
  tooltipBorder: '#3E4042',
};

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

  private readonly chartColors = computed<ChartColors>(() =>
    this.themeService.theme() === 'dark' ? DARK : LIGHT,
  );

  protected readonly chartData = computed<ChartData<'line'>>(() => {
    const points = this.summary()?.points ?? [];
    const c = this.chartColors();
    const dense = points.length > 45;
    return {
      labels: points.map((p) => p.date),
      datasets: [
        {
          label: 'Sales',
          data: points.map((p) => p.amount),
          borderColor: c.series,
          backgroundColor: c.seriesWash,
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          borderJoinStyle: 'round',
          borderCapStyle: 'round',
          pointRadius: dense ? 0 : 4,
          pointHoverRadius: 6,
          pointHitRadius: 24,
          pointBackgroundColor: c.series,
          pointBorderColor: c.surface,
          pointBorderWidth: 2,
          pointHoverBackgroundColor: c.series,
          pointHoverBorderColor: c.surface,
          pointHoverBorderWidth: 2,
        },
      ],
    };
  });

  protected readonly chartOptions = computed<NonNullable<ChartConfiguration<'line'>['options']>>(() => {
    const c = this.chartColors();
    const points = this.summary()?.points ?? [];
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 8, right: 12 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltipBg,
          titleColor: c.muted,
          bodyColor: c.tooltipText,
          borderColor: c.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          titleFont: { weight: 'normal', size: 12 },
          bodyFont: { weight: 'bold', size: 14 },
          callbacks: {
            title: (items: TooltipItem<'line'>[]) => (items[0] ? formatLongDate(String(items[0].label)) : ''),
            label: (item: TooltipItem<'line'>) => formatCurrency(Number(item.parsed.y)),
            afterBody: (items: TooltipItem<'line'>[]) => {
              const p = items[0] ? points[items[0].dataIndex] : undefined;
              return p ? `${p.transactions} transaction${p.transactions === 1 ? '' : 's'}` : '';
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: c.axis },
          ticks: {
            color: c.muted,
            maxTicksLimit: 8,
            maxRotation: 0,
            autoSkipPadding: 16,
            callback(value) {
              return formatShortDate(String(this.getLabelForValue(Number(value))));
            },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: c.grid, lineWidth: 1 },
          border: { display: false },
          ticks: {
            color: c.muted,
            maxTicksLimit: 6,
            padding: 8,
            callback: (value) => formatCompactCurrency(Number(value)),
          },
        },
      },
    };
  });

  /** Vertical hairline that snaps to the hovered X, so readers aim at a date, not a 2px line. */
  protected readonly chartPlugins: Plugin<'line'>[] = [
    {
      id: 'crosshair',
      afterDatasetsDraw: (chart) => {
        const active = chart.tooltip?.getActiveElements() ?? [];
        if (active.length === 0) return;
        const x = active[0].element.x;
        const { top, bottom } = chart.chartArea;
        const ctx = chart.ctx;
        ctx.save();
        ctx.strokeStyle = this.chartColors().axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.restore();
      },
    },
  ];

  constructor() {
    // Re-fetches automatically whenever the date range or station filter changes.
    this.sales.loadSummary(this.sales.query);
  }

  ngOnInit() {
    this.stations.loadStations();
    this.stations.loadStats();
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
