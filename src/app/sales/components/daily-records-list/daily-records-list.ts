import { Component, computed, effect, inject, input } from '@angular/core';
import { DailySalesStore, RecordsPreset } from '../../store/daily-sales.store';
import { DailySalesReport, varianceSeverity } from '../../models/daily-sales.model';
import { CURRENCY_CODE, formatLongDate } from '../../models/sales.model';

/**
 * Daily records for a station (or the manager's own) over a preset range, each expandable into the
 * expected-vs-actual report. Hosts the record/edit modal.
 */
@Component({
  selector: 'app-daily-records-list',
  standalone: false,
  templateUrl: './daily-records-list.html',
  styleUrl: './daily-records-list.css',
})
export class DailyRecordsListComponent {
  /** null = the manager's own station. Directors and admins must pass a station to record. */
  readonly stationId = input<string | null>(null);
  readonly canRecord = input(true);
  readonly title = input('Daily sales records');

  protected readonly store = inject(DailySalesStore);
  protected readonly currencyCode = CURRENCY_CODE;
  protected readonly presets: { value: RecordsPreset; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];

  protected readonly rangeLabel = computed(() => {
    const { from, to } = this.store.range();
    return `${formatLongDate(from)} – ${formatLongDate(to)}`;
  });

  protected readonly recordButtonLabel = computed(() =>
    this.store.todayRecord() ? "Edit today's record" : "Record today's sales",
  );

  constructor() {
    effect(() => this.store.setStation(this.stationId()));
    this.store.loadRecords(this.store.query);
  }

  protected setPreset(preset: RecordsPreset) {
    this.store.setPreset(preset);
  }

  protected recordToday() {
    const today = this.store.todayRecord();
    this.store.openRecordModal(today ? { record: today } : { stationId: this.stationId() });
  }

  protected edit(record: DailySalesReport, event: Event) {
    event.stopPropagation();
    this.store.openRecordModal({ record });
  }

  protected toggle(record: DailySalesReport) {
    this.store.toggleExpanded(record.id);
  }

  protected isExpanded(record: DailySalesReport): boolean {
    return this.store.expandedRecordId() === record.id;
  }

  protected severity(record: DailySalesReport): string {
    return varianceSeverity(record.totals.varianceLitres, record.totals.expectedLitres);
  }

  protected rangeSeverity(): string {
    const t = this.store.rangeTotals();
    return varianceSeverity(t.varianceLitres, t.expectedLitres);
  }

  protected sign(value: number): string {
    return value > 0 ? '+' : '';
  }

  protected day(iso: string): string {
    return formatLongDate(iso);
  }

  protected trackById(_: number, record: DailySalesReport): string {
    return record.id;
  }
}
