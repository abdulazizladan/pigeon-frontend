import { Component, computed, effect, inject, signal } from '@angular/core';
import { RepairRequestsStore } from '../../store/repair-requests.store';
import { REPAIR_PRIORITIES, RepairPriority, repairPriorityDescription, repairPriorityLabel } from '../../models/maintenance.model';
import { Product, productLabel } from '../../../stations/models/equipment.model';

/** Report a faulty facility (a pump or anything else) and ask the director to authorize its repair. */
@Component({
  selector: 'app-repair-request-modal',
  standalone: false,
  templateUrl: './repair-request-modal.html',
  styleUrl: './repair-request-modal.css',
})
export class RepairRequestModalComponent {
  protected readonly store = inject(RepairRequestsStore);
  protected readonly priorities = REPAIR_PRIORITIES;

  protected readonly pumpId = signal<string>('');
  protected readonly facility = signal('');
  protected readonly description = signal('');
  protected readonly priority = signal<RepairPriority>('medium');

  protected readonly template = this.store.reportTemplate;
  protected readonly isSubmitting = computed(() => this.store.createLoadingState() === 'loading');
  protected readonly facilityError = computed(() => (this.facility().trim().length > 120 ? 'Keep the facility name under 120 characters.' : null));
  protected readonly descriptionError = computed(() => {
    const v = this.description().trim();
    if (v && v.length < 10) return 'Describe the fault in at least 10 characters.';
    if (v.length > 2000) return 'Description must be 2000 characters or fewer.';
    return null;
  });
  protected readonly isValid = computed(
    () => this.facility().trim().length > 0 && this.description().trim().length >= 10 && !this.facilityError() && !this.descriptionError(),
  );

  constructor() {
    effect(() => {
      if (!this.store.isReportModalOpen()) return;
      const prefill = this.store.reportPrefill();
      this.pumpId.set(prefill?.pumpId ?? '');
      this.facility.set(prefill?.facility ?? '');
      this.description.set('');
      this.priority.set('medium');
    });
  }

  protected onClose() { this.store.closeReportModal(); }
  protected onBackdropClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose(); }
  protected setFacility(e: Event) { this.facility.set((e.target as HTMLInputElement).value); }
  protected setDescription(e: Event) { this.description.set((e.target as HTMLTextAreaElement).value); }
  protected setPriority(e: Event) { this.priority.set((e.target as HTMLInputElement).value as RepairPriority); }

  protected setPump(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    this.pumpId.set(id);
    const pump = this.template()?.pumps.find((p) => p.pumpId === id);
    if (pump && (!this.facility().trim() || this.template()?.pumps.some((p) => p.name === this.facility().trim()))) {
      this.facility.set(pump.name);
    }
  }

  protected onSubmit(e: Event) {
    e.preventDefault();
    if (!this.isValid() || this.isSubmitting()) return;
    const prefill = this.store.reportPrefill();
    this.store.createRequest({
      ...(prefill?.stationId ? { stationId: prefill.stationId } : {}),
      ...(this.pumpId() ? { pumpId: this.pumpId() } : {}),
      facility: this.facility().trim(),
      description: this.description().trim(),
      priority: this.priority(),
      ...(prefill?.healthCheckId ? { healthCheckId: prefill.healthCheckId } : {}),
    });
  }

  protected label(p: RepairPriority) { return repairPriorityLabel(p); }
  protected describe(p: RepairPriority) { return repairPriorityDescription(p); }
  protected product(p: Product) { return productLabel(p); }
}
