import { Component, inject } from '@angular/core';
import { RepairRequestsStore } from '../../store/repair-requests.store';

/** Director / admin page: every repair request across the network, with decisions. */
@Component({
  selector: 'app-repair-requests-page',
  standalone: false,
  template: `
    <div class="mp-page">
      <header class="mp-header">
        <h1 class="mp-title">Repair Requests</h1>
        <p class="mp-subtitle">Faults reported by station managers. Authorize, deny, or leave for later.</p>
      </header>

      @if (store.stats(); as st) {
        <div class="stats-cards-container mp-kpis">
          <div class="stat-card stat-open"><div class="stat-info"><div class="stat-title">Pending</div><div class="stat-value">{{ st.byStatus.pending }}</div></div></div>
          <div class="stat-card stat-urgent"><div class="stat-info"><div class="stat-title">Pending · high / urgent</div><div class="stat-value">{{ st.pendingByPriority.high }}</div></div></div>
          <div class="stat-card stat-resolved"><div class="stat-info"><div class="stat-title">Authorized</div><div class="stat-value">{{ st.byStatus.authorized }}</div></div></div>
          <div class="stat-card stat-closed"><div class="stat-info"><div class="stat-title">Denied / no action</div><div class="stat-value">{{ st.byStatus.denied + st.byStatus.ignored }}</div></div></div>
        </div>
      }

      <app-repair-requests-list [stationId]="null" [canDecide]="true" [canReport]="false" [showStation]="true" title="All requests"></app-repair-requests-list>
    </div>
  `,
  styles: [`
    .mp-page { padding: 8px 0 24px; max-width: 1100px; margin: 0 auto; }
    .mp-header { margin-bottom: 20px; }
    .mp-title { margin: 0 0 4px; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: var(--text-primary); }
    .mp-subtitle { margin: 0; font-size: 15px; color: var(--text-secondary); }
    .mp-kpis { margin-bottom: 20px; }
  `],
})
export class RepairRequestsPageComponent {
  protected readonly store = inject(RepairRequestsStore);
}
