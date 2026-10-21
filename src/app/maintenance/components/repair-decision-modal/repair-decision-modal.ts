import { Component, computed, effect, inject, signal } from '@angular/core';
import { RepairRequestsStore } from '../../store/repair-requests.store';
import { REPAIR_DECISIONS, RepairDecision, repairDecisionDescription, repairDecisionLabel, repairPriorityLabel, RepairPriority } from '../../models/maintenance.model';

/** Director's call on a repair request: authorize, deny, or take no action, with an optional note. */
@Component({
  selector: 'app-repair-decision-modal',
  standalone: false,
  templateUrl: './repair-decision-modal.html',
  styleUrl: './repair-decision-modal.css',
})
export class RepairDecisionModalComponent {
  protected readonly store = inject(RepairRequestsStore);
  protected readonly decisions = REPAIR_DECISIONS;
  protected readonly request = this.store.decidingRequest;
  protected readonly decision = signal<RepairDecision>('authorize');
  protected readonly note = signal('');
  protected readonly isSubmitting = computed(() => this.store.decideLoadingState() === 'loading');
  protected readonly needsNote = computed(() => this.decision() === 'deny');
  protected readonly isValid = computed(() => !this.needsNote() || this.note().trim().length >= 5);

  constructor() {
    effect(() => {
      if (this.store.isDecisionModalOpen()) {
        this.decision.set('authorize');
        this.note.set('');
      }
    });
  }

  protected onClose() { this.store.closeDecisionModal(); }
  protected onBackdropClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose(); }
  protected setDecision(e: Event) { this.decision.set((e.target as HTMLInputElement).value as RepairDecision); }
  protected setNote(e: Event) { this.note.set((e.target as HTMLTextAreaElement).value); }

  protected onSubmit(e: Event) {
    e.preventDefault();
    const r = this.request();
    if (!r || !this.isValid() || this.isSubmitting()) return;
    const note = this.note().trim();
    this.store.decide({ id: r.id, payload: { decision: this.decision(), ...(note ? { note } : {}) } });
  }

  protected label(d: RepairDecision) { return repairDecisionLabel(d); }
  protected describe(d: RepairDecision) { return repairDecisionDescription(d); }
  protected priority(p: RepairPriority) { return repairPriorityLabel(p); }
}
