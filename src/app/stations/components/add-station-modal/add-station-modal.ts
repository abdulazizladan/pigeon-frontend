import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { StationsStore } from '../../store/stations.store';
import { ManagersStore } from '../../../managers/store/managers.store';
import {
  NIGERIAN_STATES,
  STATION_STATUSES,
  StationStatus,
  stationStatusDescription,
  stationStatusLabel,
} from '../../models/station.model';

/** Value for the manager picker meaning "leave unassigned". */
const NO_MANAGER = '';

@Component({
  selector: 'app-add-station-modal',
  standalone: false,
  templateUrl: './add-station-modal.html',
  styleUrl: './add-station-modal.css',
})
export class AddStationModalComponent implements OnDestroy {
  protected readonly store = inject(StationsStore);
  protected readonly managers = inject(ManagersStore);

  protected readonly states = NIGERIAN_STATES;
  protected readonly statuses = STATION_STATUSES;
  protected readonly noManager = NO_MANAGER;

  protected readonly name = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly address = signal<string>('');
  protected readonly lga = signal<string>('');
  protected readonly state = signal<string>('');
  protected readonly status = signal<StationStatus>('active');
  protected readonly managerId = signal<string>(NO_MANAGER);

  protected readonly nameError = computed(() => {
    const val = this.name().trim();
    if (val && val.length < 3) return 'Name must be at least 3 characters.';
    if (val.length > 80) return 'Name must be 80 characters or fewer.';
    return null;
  });

  protected readonly addressError = computed(() => {
    const val = this.address().trim();
    if (val && val.length < 5) return 'Enter a fuller street address.';
    if (val.length > 160) return 'Address must be 160 characters or fewer.';
    return null;
  });

  protected readonly lgaError = computed(() => (this.lga().trim().length > 80 ? 'LGA must be 80 characters or fewer.' : null));

  protected readonly descriptionError = computed(() =>
    this.description().trim().length > 1000 ? 'Description must be 1000 characters or fewer.' : null,
  );

  protected readonly isFormValid = computed(
    () =>
      this.name().trim().length >= 3 &&
      this.address().trim().length >= 5 &&
      this.lga().trim().length > 0 &&
      this.state().length > 0 &&
      !this.nameError() &&
      !this.addressError() &&
      !this.lgaError() &&
      !this.descriptionError(),
  );

  protected readonly isSubmitting = computed(() => this.store.createLoadingState() === 'loading');

  /** Active managers; ones already running a station are shown but disabled. */
  protected readonly managerOptions = computed(() =>
    this.managers.activeManagers().map((m) => ({
      id: m.id,
      label: [m.firstName, m.lastName].filter(Boolean).join(' ') || m.username,
      username: m.username,
      assignedTo: m.station?.name ?? null,
    })),
  );

  constructor() {
    effect(() => {
      if (this.store.isAddStationModalOpen() && this.managers.loadingState() === 'idle') {
        this.managers.loadManagers();
      }
    });
    effect(() => {
      if (this.store.createLoadingState() === 'success') {
        this.resetForm();
        this.managers.loadManagers(); // assignment changed
      }
    });
  }

  ngOnDestroy() {
    this.resetForm();
  }

  protected onClose() {
    this.store.closeAddStationModal();
    this.resetForm();
  }

  protected onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) {
      this.onClose();
    }
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid() || this.isSubmitting()) return;
    const description = this.description().trim();
    const managerId = this.managerId();
    this.store.createStation({
      name: this.name().trim(),
      ...(description ? { description } : {}),
      address: this.address().trim(),
      lga: this.lga().trim(),
      state: this.state(),
      status: this.status(),
      ...(managerId ? { managerId } : {}),
    });
  }

  protected updateName(e: Event) { this.name.set((e.target as HTMLInputElement).value); }
  protected updateDescription(e: Event) { this.description.set((e.target as HTMLTextAreaElement).value); }
  protected updateAddress(e: Event) { this.address.set((e.target as HTMLInputElement).value); }
  protected updateLga(e: Event) { this.lga.set((e.target as HTMLInputElement).value); }
  protected updateState(e: Event) { this.state.set((e.target as HTMLSelectElement).value); }
  protected updateStatus(e: Event) { this.status.set((e.target as HTMLInputElement).value as StationStatus); }
  protected updateManager(e: Event) { this.managerId.set((e.target as HTMLSelectElement).value); }

  protected statusLabel(status: StationStatus): string {
    return stationStatusLabel(status);
  }

  protected statusDescription(status: StationStatus): string {
    return stationStatusDescription(status);
  }

  private resetForm() {
    this.name.set('');
    this.description.set('');
    this.address.set('');
    this.lga.set('');
    this.state.set('');
    this.status.set('active');
    this.managerId.set(NO_MANAGER);
  }
}
