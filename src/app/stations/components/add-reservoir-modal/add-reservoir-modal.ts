import { Component, computed, effect, inject, signal } from '@angular/core';
import { StationEquipmentStore } from '../../store/station-equipment.store';
import { Product, productLabel } from '../../models/equipment.model';

@Component({
  selector: 'app-add-reservoir-modal',
  standalone: false,
  templateUrl: './add-reservoir-modal.html',
  styleUrl: './add-reservoir-modal.css',
})
export class AddReservoirModalComponent {
  protected readonly store = inject(StationEquipmentStore);

  protected readonly product = signal<Product | ''>('');
  protected readonly capacity = signal('');

  protected readonly options = this.store.missingReservoirProducts;
  protected readonly capacityError = computed(() => {
    const v = this.capacity().trim();
    if (!v) return null;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) return 'Capacity must be at least 1 litre.';
    return null;
  });
  protected readonly isValid = computed(() => !!this.product() && this.capacity().trim() !== '' && !this.capacityError());
  protected readonly isSubmitting = computed(() => this.store.saveLoadingState() === 'loading');

  constructor() {
    effect(() => {
      if (this.store.isAddReservoirModalOpen()) {
        this.product.set(this.options()[0] ?? '');
        this.capacity.set('');
      }
    });
  }

  protected onClose() { this.store.closeAddReservoirModal(); }
  protected onBackdropClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose(); }
  protected setProduct(e: Event) { this.product.set((e.target as HTMLInputElement).value as Product); }
  protected setCapacity(e: Event) { this.capacity.set((e.target as HTMLInputElement).value); }
  protected label(p: Product) { return productLabel(p); }

  protected onSubmit(e: Event) {
    e.preventDefault();
    const product = this.product();
    if (!product || !this.isValid() || this.isSubmitting()) return;
    this.store.createReservoir({ product, capacityLitres: Number(this.capacity()) });
  }
}
