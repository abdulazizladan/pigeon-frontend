import type { ChartConfiguration, ChartData, Plugin, TooltipItem } from 'chart.js';
import { SalesPoint, formatCompactCurrency, formatCurrency, formatLongDate, formatShortDate } from '../models/sales.model';

/** Colours for the single-series daily sales line, validated against the light and dark card surfaces. */
export interface SalesChartColors {
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

export const SALES_CHART_LIGHT: SalesChartColors = {
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

export const SALES_CHART_DARK: SalesChartColors = {
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

export function salesChartColors(theme: 'light' | 'dark'): SalesChartColors {
  return theme === 'dark' ? SALES_CHART_DARK : SALES_CHART_LIGHT;
}

/** One series: ₦ per day. Markers are hidden past 45 points so dense ranges stay readable. */
export function buildSalesChartData(points: SalesPoint[], c: SalesChartColors): ChartData<'line'> {
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
}

export function buildSalesChartOptions(points: SalesPoint[], c: SalesChartColors): NonNullable<ChartConfiguration<'line'>['options']> {
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
            if (!p) return '';
            return `${Math.round(p.litres).toLocaleString()} L · ${p.transactions} pump reading${p.transactions === 1 ? '' : 's'}`;
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
}

/** Vertical hairline that snaps to the hovered day, so readers aim at a date rather than a 2px line. */
export function crosshairPlugin(color: () => string): Plugin<'line'> {
  return {
    id: 'crosshair',
    afterDatasetsDraw: (chart) => {
      const active = chart.tooltip?.getActiveElements() ?? [];
      if (active.length === 0) return;
      const x = active[0].element.x;
      const { top, bottom } = chart.chartArea;
      const ctx = chart.ctx;
      ctx.save();
      ctx.strokeStyle = color();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.restore();
    },
  };
}
