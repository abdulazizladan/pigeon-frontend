import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dispenser } from '../../models/dispenser.model';
import { DispenserStore } from '../../store/dispensers.store';
import { Sale } from '../../../sales-management/models/sale.model';

@Component({
  selector: 'app-dispenser-details',
  standalone: false,
  templateUrl: './dispenser-details.component.html',
  styleUrl: './dispenser-details.component.scss'
})
export class DispenserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dispenserStore = inject(DispenserStore);

  dispenser = signal<Dispenser | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed property for the last sale
  lastSale = computed(() => {
    const sales = this.dispenser()?.sales;
    if (!sales || sales.length === 0) return null;
    return sales[sales.length - 1];
  });

  async ngOnInit() {
    const dispenserId = this.route.snapshot.paramMap.get('id');
    if (dispenserId) {
      await this.loadDispenser(dispenserId);
    }
  }

  async loadDispenser(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      // TODO: Replace with actual service call when available
      // For now, using mock data
      const mockDispenser: Dispenser = {
        id: id,
        firsName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        phone: '+234 801 234 5678',
        status: 'active',
        dateAdded: new Date('2024-01-15'),
        sales: [
          {
            id: '1',
            product: 'Petrol',
            pricePerLitre: 617,
            openingMeterReading: 1000,
            closingMeterReading: 1500,
            totalPrice: 308500,
            createdAt: new Date('2024-11-01'),
            recordedBy: {} as any,
            station: {} as any,
            pump: {} as any
          },
          {
            id: '2',
            product: 'Diesel',
            pricePerLitre: 650,
            openingMeterReading: 2000,
            closingMeterReading: 2300,
            totalPrice: 195000,
            createdAt: new Date('2024-11-15'),
            recordedBy: {} as any,
            station: {} as any,
            pump: {} as any
          }
        ]
      };
      this.dispenser.set(mockDispenser);
    } catch (err) {
      console.error('Error loading dispenser:', err);
      this.error.set('Failed to load dispenser data. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    return status === 'active' ? '#10b981' : '#ef4444';
  }

  getStatusIcon(status: string): string {
    return status === 'active' ? 'check_circle' : 'cancel';
  }
}
