import { Component, computed, effect, inject, input } from '@angular/core';
import { RepairRequestsStore } from '../../store/repair-requests.store';
import {
  REPAIR_PRIORITIES, REPAIR_STATUSES, RepairPriority, RepairRequest, RepairStatus,
  canDecide, repairPriorityLabel, repairStatusLabel,
} from '../../models/maintenance.model';

/**
 * Repair requests with status and priority filters. Managers see their station and can report
 * faults; directors and admins can decide. Hosts the report-fault and decision modals.
 */
@Component({
  selector: 'app-repair-requests-list',
  standalone: false,
  templateUrl: './repair-requests-list.html',
  styleUrl: './repair-requests-list.css',
})
export class RepairRequestsListComponent {
  readonly stationId = input<string | null>(null);
  readonly canDecide = input(false);
  readonly canReport = input(false);
  readonly title = input('Repair requests');
  /** Show the station column (useful when listing every station). */
  readonly showStation = input(false);

  protected readonly store = inject(RepairRequestsStore);
  protected readonly statusFilters: (RepairStatus | 'all')[] = ['all', ...REPAIR_STATUSES];
  protected readonly priorityFilters: (RepairPriority | 'all')[] = ['all', ...REPAIR_PRIORITIES];
  protected readonly expanded = computed(() => this.store.requests());

  constructor() {
    effect(() => {
      this.store.setStation(this.stationId());
      this.store.loadStats(this.stationId());
    });
    this.store.loadRequests(this.store.query);
  }

  protected report() { this.store.openReportModal({ stationId: this.stationId() }); }
  protected decide(r: RepairRequest) { this.store.openDecisionModal(r); }
  protected decidable(r: RepairRequest) { return this.canDecide() && canDecide(r.status); }
  protected setStatus(s: RepairStatus | 'all') { this.store.setStatusFilter(s); }
  protected setPriority(e: Event) { this.store.setPriorityFilter((e.target as HTMLSelectElement).value as RepairPriority | 'all'); }
  protected statusLabel(s: RepairStatus | 'all') { return s === 'all' ? 'All' : repairStatusLabel(s); }
  protected priorityLabel(p: RepairPriority | 'all') { return p === 'all' ? 'All priorities' : repairPriorityLabel(p); }
  protected statusCount(s: RepairStatus | 'all') { const st = this.store.stats(); return !st ? null : s === 'all' ? st.total : st.byStatus[s]; }
  protected trackById(_: number, r: RepairRequest) { return r.id; }
}
