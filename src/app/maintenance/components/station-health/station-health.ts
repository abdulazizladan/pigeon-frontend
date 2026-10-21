import { Component, computed, effect, inject, input } from '@angular/core';
import { HealthChecksStore, ChecksPreset } from '../../store/health-checks.store';
import { RepairRequestsStore } from '../../store/repair-requests.store';
import {
  HealthCheckReport, PumpCheck, PumpCondition, StationCondition,
  pumpConditionLabel, stationConditionDescription, stationConditionLabel,
} from '../../models/maintenance.model';
import { formatLongDate } from '../../../sales/models/sales.model';
import { productLabel, Product } from '../../../stations/models/equipment.model';

/**
 * Latest health check for a station plus its history. Hosts the record/edit modal.
 * The report-fault modal is hosted by app-repair-requests-list, which every page using this also shows.
 */
@Component({
  selector: 'app-station-health',
  standalone: false,
  templateUrl: './station-health.html',
  styleUrl: './station-health.css',
})
export class StationHealthComponent {
  readonly stationId = input<string | null>(null);
  readonly canRecord = input(false);
  readonly canReport = input(false);
  readonly title = input('Station health');

  protected readonly store = inject(HealthChecksStore);
  protected readonly repairs = inject(RepairRequestsStore);
  protected readonly presets: { value: ChecksPreset; label: string }[] = [
    { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }, { value: '90d', label: 'Last 90 days' },
  ];

  protected readonly latest = this.store.latest;
  protected readonly recordLabel = computed(() => (this.store.todayCheck() ? "Edit today's check" : "Record today's check"));

  constructor() {
    effect(() => this.store.setStation(this.stationId()));
    this.store.loadChecks(this.store.query);
  }

  protected record() {
    const today = this.store.todayCheck();
    this.store.openCheckModal(today ? { check: today } : { stationId: this.stationId() });
  }

  protected edit(check: HealthCheckReport, e: Event) {
    e.stopPropagation();
    this.store.openCheckModal({ check });
  }

  protected reportPump(check: HealthCheckReport, pump: PumpCheck, e: Event) {
    e.stopPropagation();
    this.repairs.openReportModal({ stationId: this.stationId() ?? check.stationId, pumpId: pump.pumpId, facility: pump.pumpName, healthCheckId: check.id });
  }

  protected setPreset(p: ChecksPreset) { this.store.setPreset(p); }
  protected toggle(c: HealthCheckReport) { this.store.toggleExpanded(c.id); }
  protected isExpanded(c: HealthCheckReport) { return this.store.expandedId() === c.id; }
  protected day(iso: string) { return formatLongDate(iso); }
  protected scLabel(c: StationCondition) { return stationConditionLabel(c); }
  protected scDescription(c: StationCondition) { return stationConditionDescription(c); }
  protected pcLabel(c: PumpCondition) { return pumpConditionLabel(c); }
  protected product(p: Product) { return productLabel(p); }
  protected trackById(_: number, c: HealthCheckReport) { return c.id; }
  protected trackPump(_: number, p: PumpCheck) { return p.id; }
}
