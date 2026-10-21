import { Component, computed, effect, inject, signal } from '@angular/core';
import { HealthChecksStore } from '../../store/health-checks.store';
import {
  CreateHealthCheckPayload, PUMP_CONDITIONS, PumpCondition, STATION_CONDITIONS, StationCondition,
  pumpConditionLabel, stationConditionDescription, stationConditionLabel,
} from '../../models/maintenance.model';
import { Product, productLabel } from '../../../stations/models/equipment.model';
import { formatLocalDate } from '../../../sales/models/sales.model';

interface PumpInput { condition: PumpCondition; notes: string }

/** The manager's walk-round form: one condition for the station and one per pump, with notes. */
@Component({
  selector: 'app-health-check-modal',
  standalone: false,
  templateUrl: './health-check-modal.html',
  styleUrl: './health-check-modal.css',
})
export class HealthCheckModalComponent {
  protected readonly store = inject(HealthChecksStore);
  protected readonly stationConditions = STATION_CONDITIONS;
  protected readonly pumpConditions = PUMP_CONDITIONS;
  protected readonly today = formatLocalDate(new Date());

  protected readonly recordedOn = signal(this.today);
  protected readonly stationCondition = signal<StationCondition>('good');
  protected readonly notes = signal('');
  private readonly pumpInputs = signal<Record<string, PumpInput>>({});

  protected readonly template = this.store.template;
  protected readonly isEditing = computed(() => this.store.editingCheck() !== null);

  protected readonly rows = computed(() => {
    const t = this.template();
    if (!t) return [];
    const inputs = this.pumpInputs();
    return t.pumps.map((p) => ({ pump: p, input: inputs[p.pumpId] ?? { condition: 'ok' as PumpCondition, notes: '' } }));
  });

  protected readonly notOkCount = computed(() => this.rows().filter((r) => r.input.condition !== 'ok').length);
  protected readonly isComplete = computed(() => {
    const t = this.template();
    return !!t && t.pumps.length > 0 && !!this.recordedOn() && this.recordedOn() <= this.today;
  });

  constructor() {
    effect(() => {
      const t = this.template();
      if (!t) return;
      const editing = this.store.editingCheck();
      const byPump = new Map(editing?.pumps.map((p) => [p.pumpId, p]) ?? []);
      const inputs: Record<string, PumpInput> = {};
      for (const p of t.pumps) {
        const line = byPump.get(p.pumpId);
        inputs[p.pumpId] = {
          condition: line ? line.condition : p.status === 'inactive' ? 'out_of_service' : p.lastCondition ?? 'ok',
          notes: line?.notes ?? '',
        };
      }
      this.pumpInputs.set(inputs);
      this.recordedOn.set(editing ? editing.recordedOn : t.recordedOn);
      this.stationCondition.set(editing ? editing.stationCondition : t.lastStationCondition ?? 'good');
      this.notes.set(editing?.notes ?? '');
    });
  }

  protected onClose() { this.store.closeCheckModal(); }
  protected onBackdropClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose(); }
  protected setDate(e: Event) { this.recordedOn.set((e.target as HTMLInputElement).value); }
  protected setStationCondition(e: Event) { this.stationCondition.set((e.target as HTMLInputElement).value as StationCondition); }
  protected setNotes(e: Event) { this.notes.set((e.target as HTMLTextAreaElement).value); }

  protected setPumpCondition(pumpId: string, condition: PumpCondition) {
    this.pumpInputs.update((all) => ({ ...all, [pumpId]: { ...(all[pumpId] ?? { condition: 'ok', notes: '' }), condition } }));
  }

  protected setPumpNotes(pumpId: string, e: Event) {
    const notes = (e.target as HTMLInputElement).value;
    this.pumpInputs.update((all) => ({ ...all, [pumpId]: { ...(all[pumpId] ?? { condition: 'ok', notes: '' }), notes } }));
  }

  protected onSubmit(e: Event) {
    e.preventDefault();
    if (!this.isComplete() || this.store.isSaving()) return;
    const editing = this.store.editingCheck();
    const notes = this.notes().trim();
    const payload: CreateHealthCheckPayload = {
      ...(editing || !this.store.modalStationId() ? {} : { stationId: this.store.modalStationId()! }),
      recordedOn: this.recordedOn(),
      stationCondition: this.stationCondition(),
      ...(notes ? { notes } : {}),
      pumps: this.rows().map((r) => ({
        pumpId: r.pump.pumpId,
        condition: r.input.condition,
        ...(r.input.notes.trim() ? { notes: r.input.notes.trim() } : {}),
      })),
    };
    this.store.saveCheck({ checkId: editing?.id ?? null, payload });
  }

  protected scLabel(c: StationCondition) { return stationConditionLabel(c); }
  protected scDescription(c: StationCondition) { return stationConditionDescription(c); }
  protected pcLabel(c: PumpCondition) { return pumpConditionLabel(c); }
  protected product(p: Product) { return productLabel(p); }
}
