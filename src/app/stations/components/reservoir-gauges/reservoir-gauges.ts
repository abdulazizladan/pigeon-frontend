import { Component, effect, inject, input } from '@angular/core';
import { ReservoirLevelsStore } from '../../store/reservoir-levels.store';
import { Product, ReservoirLevelIndicator, levelStatusLabel, productLabel } from '../../models/equipment.model';
import { formatLongDate } from '../../../sales/models/sales.model';

/** Tank gauges showing how much of each product is left in a station's reservoirs. Hosts the record modal. */
@Component({
  selector: 'app-reservoir-gauges',
  standalone: false,
  templateUrl: './reservoir-gauges.html',
  styleUrl: './reservoir-gauges.css',
})
export class ReservoirGaugesComponent {
  readonly stationId = input<string | null>(null);
  readonly canRecord = input(false);
  readonly title = input('Reservoir levels');

  protected readonly store = inject(ReservoirLevelsStore);

  constructor() {
    effect(() => {
      this.store.setStation(this.stationId());
      this.store.loadLevels(this.stationId());
    });
  }

  protected record() { this.store.openRecordModal(); }
  protected refresh() { this.store.loadLevels(this.stationId()); }
  protected label(p: Product) { return productLabel(p); }
  protected statusLabel(r: ReservoirLevelIndicator) { return levelStatusLabel(r.status); }
  protected day(iso: string) { return formatLongDate(iso); }
  protected trackById(_: number, r: ReservoirLevelIndicator) { return r.reservoirId; }

  /** "about 3 days" style estimate, capped so a near-empty tank reads honestly. */
  protected daysText(r: ReservoirLevelIndicator): string | null {
    if (r.daysRemaining === null) return null;
    if (r.daysRemaining < 1) return 'less than a day';
    const d = Math.round(r.daysRemaining);
    return `${d} day${d === 1 ? '' : 's'}`;
  }
}
