import { Component, computed, effect, inject, signal } from '@angular/core';
import { StationsStore } from '../../store/stations.store';
import { ManagersStore } from '../../../managers/store/managers.store';

/**
 * Picks an active, unassigned manager for the station the store opened the
 * modal for. Managers already running another station are listed but disabled.
 */
@Component({
  selector: 'app-assign-manager-modal',
  standalone: false,
  templateUrl: './assign-manager-modal.html',
  styleUrl: './assign-manager-modal.css',
})
export class AssignManagerModalComponent {
  protected readonly store = inject(StationsStore);
  protected readonly managers = inject(ManagersStore);

  protected readonly station = this.store.assignModalStation;
  protected readonly selectedId = signal<string>('');
  protected readonly search = signal<string>('');

  protected readonly isSubmitting = computed(() => {
    const s = this.station();
    return !!s && this.store.isUpdating(s.id);
  });

  protected readonly options = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.managers
      .activeManagers()
      .map((m) => ({
        id: m.id,
        name: [m.firstName, m.lastName].filter(Boolean).join(' ') || m.username,
        username: m.username,
        phone: m.phoneNumber,
        assignedTo: m.station?.name ?? null,
      }))
      .filter((o) => !q || o.name.toLowerCase().includes(q) || o.username.toLowerCase().includes(q))
      .sort((a, b) => Number(!!a.assignedTo) - Number(!!b.assignedTo) || a.name.localeCompare(b.name));
  });

  protected readonly availableCount = computed(() => this.options().filter((o) => !o.assignedTo).length);

  constructor() {
    effect(() => {
      if (this.store.isAssignManagerModalOpen()) {
        this.managers.loadManagers();
        this.selectedId.set('');
        this.search.set('');
      }
    });
  }

  protected onClose() {
    this.store.closeAssignManagerModal();
  }

  protected onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) {
      this.onClose();
    }
  }

  protected onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected select(id: string, disabled: boolean) {
    if (!disabled) this.selectedId.set(id);
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    const s = this.station();
    const managerId = this.selectedId();
    if (!s || !managerId || this.isSubmitting()) return;
    this.store.updateStation({ id: s.id, changes: { managerId } });
  }
}
