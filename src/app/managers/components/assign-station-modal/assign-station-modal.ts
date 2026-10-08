import { Component, computed, effect, inject, signal } from '@angular/core';
import { ManagersStore } from '../../store/managers.store';
import { StationsStore } from '../../../stations/store/stations.store';
import { StationStatus, stationLocation, stationStatusLabel } from '../../../stations/models/station.model';
import { fullName } from '../../../users-management/models/user.model';

/**
 * Picks a station for the manager the store opened the modal for. Stations that
 * already have a manager are shown but disabled so an assignment never silently
 * displaces someone.
 */
@Component({
  selector: 'app-assign-station-modal',
  standalone: false,
  templateUrl: './assign-station-modal.html',
  styleUrl: './assign-station-modal.css',
})
export class AssignStationModalComponent {
  protected readonly store = inject(ManagersStore);
  protected readonly stations = inject(StationsStore);

  protected readonly manager = this.store.assignModalManager;
  protected readonly selectedId = signal<string>('');
  protected readonly search = signal<string>('');

  protected readonly managerName = computed(() => {
    const m = this.manager();
    return m ? fullName(m) : '';
  });

  protected readonly isSubmitting = computed(() => {
    const m = this.manager();
    return !!m && this.store.isUpdating(m.id);
  });

  protected readonly options = computed(() => {
    const q = this.search().toLowerCase().trim();
    const currentId = this.manager()?.station?.id ?? null;
    return this.stations
      .stations()
      .filter((s) => s.id !== currentId)
      .map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        status: s.status,
        location: stationLocation(s),
        takenBy: s.managerUsername,
      }))
      .filter((o) => !q || o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q) || o.location.toLowerCase().includes(q))
      .sort((a, b) => Number(!!a.takenBy) - Number(!!b.takenBy) || a.name.localeCompare(b.name));
  });

  protected readonly availableCount = computed(() => this.options().filter((o) => !o.takenBy).length);

  constructor() {
    effect(() => {
      if (this.store.isAssignStationModalOpen()) {
        this.stations.loadStations();
        this.selectedId.set('');
        this.search.set('');
      }
    });
  }

  protected onClose() {
    this.store.closeAssignStationModal();
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
    const m = this.manager();
    const stationId = this.selectedId();
    if (!m || !stationId || this.isSubmitting()) return;
    this.store.assignStation({ managerId: m.id, stationId });
  }

  protected statusLabel(status: StationStatus): string {
    return stationStatusLabel(status);
  }
}
