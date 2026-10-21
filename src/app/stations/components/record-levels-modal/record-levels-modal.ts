import { Component, computed, effect, inject, signal } from '@angular/core';
import { ReservoirLevelsStore } from '../../store/reservoir-levels.store';
import { Product, productLabel } from '../../models/equipment.model';
import { formatLocalDate } from '../../../sales/models/sales.model';

/** End-of-day dip reading for every reservoir. Prefilled with the latest known level. */
@Component({
  selector: 'app-record-levels-modal',
  standalone: false,
  templateUrl: './record-levels-modal.html',
  styleUrl: './record-levels-modal.css',
})
export class RecordLevelsModalComponent {
  protected readonly store = inject(ReservoirLevelsStore);
  protected readonly today = formatLocalDate(new Date());
  protected readonly recordedOn = signal(this.today);
  private readonly inputs = signal<Record<string, string>>({});

  protected readonly rows = computed(() =>
    this.store.reservoirs().map((r) => {
      const raw = this.inputs()[r.reservoirId] ?? '';
      const n = raw.trim() === '' ? null : Number(raw);
      const value = n !== null && Number.isFinite(n) ? n : null;
      const error = value === null ? null : value < 0 ? 'Cannot be negative.' : value > r.capacityLitres ? `Exceeds the ${r.capacityLitres.toLocaleString()} L capacity.` : null;
      const percent = value !== null && !error ? Math.round((value / r.capacityLitres) * 100) : null;
      return { r, raw, value, error, percent };
    }),
  );

  protected readonly isComplete = computed(
    () => this.rows().length > 0 && this.rows().every((x) => x.value !== null && !x.error) && this.recordedOn() <= this.today,
  );

  constructor() {
    effect(() => {
      if (!this.store.isRecordModalOpen()) return;
      const inputs: Record<string, string> = {};
      for (const r of this.store.reservoirs()) inputs[r.reservoirId] = r.level !== null ? String(r.level) : '';
      this.inputs.set(inputs);
      this.recordedOn.set(this.today);
    });
  }

  protected onClose() { this.store.closeRecordModal(); }
  protected onBackdropClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose(); }
  protected setDate(e: Event) { this.recordedOn.set((e.target as HTMLInputElement).value); }
  protected setLevel(id: string, e: Event) {
    const v = (e.target as HTMLInputElement).value;
    this.inputs.update((all) => ({ ...all, [id]: v }));
  }

  protected onSubmit(e: Event) {
    e.preventDefault();
    if (!this.isComplete() || this.store.isSaving()) return;
    const stationId = this.store.stationId();
    this.store.recordLevels({
      ...(stationId ? { stationId } : {}),
      recordedOn: this.recordedOn(),
      levels: this.rows().map((x) => ({ reservoirId: x.r.reservoirId, level: x.value! })),
    });
  }

  protected label(p: Product) { return productLabel(p); }
}
