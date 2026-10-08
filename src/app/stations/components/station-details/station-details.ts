import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StationsStore } from '../../store/stations.store';
import { ManagersStore } from '../../../managers/store/managers.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { StationStatus, stationStatusDescription, stationStatusLabel } from '../../models/station.model';
import { StationEquipmentStore } from '../../store/station-equipment.store';
import { PRODUCTS, Product, Pump, Reservoir, productLabel } from '../../models/equipment.model';
import { CURRENCY_CODE } from '../../../sales/models/sales.model';

@Component({
  selector: 'app-station-details',
  standalone: false,
  templateUrl: './station-details.html',
  styleUrl: './station-details.css',
})
export class StationDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(StationsStore);
  protected readonly managers = inject(ManagersStore);
  protected readonly equipment = inject(StationEquipmentStore);
  private readonly auth = inject(AuthStore);

  protected readonly products = PRODUCTS;
  protected readonly currencyCode = CURRENCY_CODE;
  protected readonly editingPrice = signal<Product | null>(null);
  protected readonly priceDraft = signal('');
  protected readonly editingReservoirId = signal<string | null>(null);
  protected readonly capacityDraft = signal('');

  protected readonly stationId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  protected readonly station = computed(() => this.store.stationById(this.stationId()));
  protected readonly canManage = this.auth.canManageUsers;
  /** Only admins may permanently remove equipment. */
  protected readonly isAdmin = computed(() => this.auth.role() === 'admin');

  protected readonly isLoading = computed(() => this.store.loadingState() === 'loading' && !this.station());
  protected readonly loadError = computed(() =>
    this.store.loadingState() === 'error' ? this.store.errorMessage() : null,
  );
  protected readonly notFound = computed(
    () => this.store.loadingState() === 'success' && !this.station(),
  );
  protected readonly isUpdating = computed(() => this.store.isUpdating(this.stationId()));

  /** Full manager record (name, phone) when the managers list has loaded; falls back to the username. */
  protected readonly manager = computed(() => {
    const id = this.station()?.managerId;
    return id ? this.managers.managers().find((m) => m.id === id) ?? null : null;
  });

  protected readonly managerDisplayName = computed(() => {
    const m = this.manager();
    const name = m ? [m.firstName, m.lastName].filter(Boolean).join(' ') : '';
    return name || this.station()?.managerUsername || '';
  });

  protected readonly confirmUnassign = signal(false);

  private lastManagerId: string | null | undefined;

  constructor() {
    // After an assign or unassign lands, refresh managers so their station links stay accurate.
    effect(() => {
      const current = this.station();
      if (!current) return;
      const id = current.managerId;
      if (this.lastManagerId !== undefined && id !== this.lastManagerId) {
        this.managers.loadManagers();
      }
      this.lastManagerId = id;
    });
  }

  ngOnInit() {
    if (this.store.loadingState() === 'idle' || (!this.station() && this.store.loadingState() !== 'loading')) {
      this.store.loadStations();
    }
    if (this.managers.loadingState() === 'idle') {
      this.managers.loadManagers();
    }
    this.equipment.loadForStation(this.stationId());
  }

  // ---- Prices ----
  protected productLabel(product: Product): string {
    return productLabel(product);
  }

  protected startEditPrice(product: Product) {
    const current = this.equipment.priceByProduct()[product];
    this.priceDraft.set(current !== null ? String(current) : '');
    this.editingPrice.set(product);
    this.equipment.clearSaveError();
  }

  protected cancelEditPrice() {
    this.editingPrice.set(null);
  }

  protected setPriceDraft(event: Event) {
    this.priceDraft.set((event.target as HTMLInputElement).value);
  }

  protected priceDraftValid(): boolean {
    const n = Number(this.priceDraft());
    return this.priceDraft().trim() !== '' && Number.isFinite(n) && n > 0;
  }

  protected savePrice(product: Product) {
    if (!this.priceDraftValid()) return;
    this.equipment.setPrice({ product, pricePerLitre: Math.round(Number(this.priceDraft()) * 100) / 100 });
    this.editingPrice.set(null);
  }

  // ---- Pumps ----
  protected togglePump(pump: Pump) {
    this.equipment.updatePump({ id: pump.id, changes: { status: pump.status === 'active' ? 'inactive' : 'active' } });
  }

  /** The pump awaiting confirmation in the remove dialog, or null when the dialog is closed. */
  protected readonly pumpToRemove = signal<Pump | null>(null);
  protected readonly isRemovingPump = computed(() => {
    const pump = this.pumpToRemove();
    return !!pump && this.equipment.isSaving(pump.id);
  });

  protected askRemovePump(pump: Pump) {
    this.equipment.clearSaveError();
    this.pumpToRemove.set(pump);
  }

  protected cancelRemovePump() {
    this.pumpToRemove.set(null);
  }

  protected removePump() {
    const pump = this.pumpToRemove();
    if (!pump) return;
    this.equipment.deletePump(pump.id);
    this.pumpToRemove.set(null);
  }

  // ---- Reservoirs ----
  protected startEditCapacity(reservoir: Reservoir) {
    this.capacityDraft.set(String(reservoir.capacityLitres));
    this.editingReservoirId.set(reservoir.id);
    this.equipment.clearSaveError();
  }

  protected cancelEditCapacity() {
    this.editingReservoirId.set(null);
  }

  protected setCapacityDraft(event: Event) {
    this.capacityDraft.set((event.target as HTMLInputElement).value);
  }

  protected capacityDraftValid(): boolean {
    const n = Number(this.capacityDraft());
    return this.capacityDraft().trim() !== '' && Number.isFinite(n) && n >= 1;
  }

  protected saveCapacity(reservoir: Reservoir) {
    if (!this.capacityDraftValid()) return;
    this.equipment.updateReservoir({ id: reservoir.id, changes: { capacityLitres: Number(this.capacityDraft()) } });
    this.editingReservoirId.set(null);
  }

  protected trackPump(_: number, pump: Pump): string {
    return pump.id;
  }

  protected trackReservoir(_: number, reservoir: Reservoir): string {
    return reservoir.id;
  }

  protected goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected openAssign() {
    this.store.openAssignManagerModal(this.stationId());
  }

  protected askUnassign() {
    this.store.clearUpdateError();
    this.confirmUnassign.set(true);
  }

  protected cancelUnassign() {
    this.confirmUnassign.set(false);
  }

  protected unassign() {
    this.confirmUnassign.set(false);
    this.store.updateStation({ id: this.stationId(), changes: { managerId: null } });
  }

  protected statusLabel(status: StationStatus): string {
    return stationStatusLabel(status);
  }

  protected statusDescription(status: StationStatus): string {
    return stationStatusDescription(status);
  }
}
