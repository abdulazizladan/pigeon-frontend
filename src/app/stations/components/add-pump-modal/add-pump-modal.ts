import { Component, computed, effect, inject, signal } from '@angular/core';
import { StationEquipmentStore } from '../../store/station-equipment.store';
import { PRODUCTS, Product, PumpStatus, productLabel } from '../../models/equipment.model';

@Component({
  selector: 'app-add-pump-modal',
  standalone: false,
  templateUrl: './add-pump-modal.html',
  styleUrl: './add-pump-modal.css',
})
export class AddPumpModalComponent {
  protected readonly store = inject(StationEquipmentStore);
  protected readonly products = PRODUCTS;

  protected readonly name = signal('');
  protected readonly product = signal<Product>('petrol');
  protected readonly status = signal<PumpStatus>('active');

  protected readonly nameError = computed(() => {
    const v = this.name().trim();
    if (v && v.length > 40) return 'Name must be 40 characters or fewer.';
    if (v && this.store.pumps().some((p) => p.name.toLowerCase() === v.toLowerCase())) return 'This station already has a pump with that name.';
    return null;
  });

  protected readonly suggestedName = computed(() => `Pump ${this.store.pumps().length + 1}`);
  protected readonly isValid = computed(() => this.name().trim().length > 0 && !this.nameError());
  protected readonly isSubmitting = computed(() => this.store.saveLoadingState() === 'loading');

  constructor() {
    effect(() => {
      if (this.store.isAddPumpModalOpen()) {
        this.name.set(this.suggestedName());
        this.product.set('petrol');
        this.status.set('active');
      }
    });
  }

  protected onClose() { this.store.closeAddPumpModal(); }
  protected onBackdropClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose(); }
  protected setName(e: Event) { this.name.set((e.target as HTMLInputElement).value); }
  protected setProduct(e: Event) { this.product.set((e.target as HTMLInputElement).value as Product); }
  protected setStatus(e: Event) { this.status.set((e.target as HTMLInputElement).checked ? 'active' : 'inactive'); }
  protected label(p: Product) { return productLabel(p); }

  protected onSubmit(e: Event) {
    e.preventDefault();
    if (!this.isValid() || this.isSubmitting()) return;
    this.store.createPump({ name: this.name().trim(), product: this.product(), status: this.status() });
  }
}
