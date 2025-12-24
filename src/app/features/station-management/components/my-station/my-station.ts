import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Station } from '../../models/station.model';
import { StationStore } from '../../store/station.store';
import { ManagerStore } from '../../../../users/manager/store/manager.store';

interface TankLevel {
  product: 'Petrol' | 'Diesel';
  currentVolume: number;
  capacity: number;
  percentage: number;
}

interface PumpStatus {
  id: string;
  number: number;
  product: 'Petrol' | 'Diesel';
  status: 'Active' | 'Idle' | 'Maintenance' | 'Offline';
  currentSession?: {
    vehicle: string;
    liters: number;
    amount: number;
  };
}

interface RecentTransaction {
  id: string;
  time: string;
  product: 'Petrol' | 'Diesel';
  liters: number;
  amount: number;
  paymentMethod: 'Cash' | 'POS' | 'Transfer';
  status: 'Completed' | 'Pending';
}

@Component({
  selector: 'app-my-station',
  standalone: false,
  templateUrl: './my-station.html',
  styleUrl: './my-station.scss'
})
export class MyStation implements OnInit {

  public stationStore = inject(StationStore);
  public managerStore = inject(ManagerStore);

  // --- Dummy Data Signals ---

  // 1. Tank Levels
  public tankLevels = signal<TankLevel[]>([
    { product: 'Petrol', currentVolume: 12500, capacity: 20000, percentage: 62.5 },
    { product: 'Diesel', currentVolume: 8200, capacity: 15000, percentage: 54.6 }
  ]);

  // 2. Pump Statuses
  public pumpStatuses = signal<PumpStatus[]>([
    { id: 'P1', number: 1, product: 'Petrol', status: 'Active', currentSession: { vehicle: 'Toyota Camry', liters: 25.5, amount: 16575 } },
    { id: 'P2', number: 2, product: 'Petrol', status: 'Idle' },
    { id: 'P3', number: 3, product: 'Diesel', status: 'Active', currentSession: { vehicle: 'Mack Truck', liters: 150, amount: 127500 } },
    { id: 'P4', number: 4, product: 'Diesel', status: 'Maintenance' },
  ]);

  // 3. Recent Transactions
  public recentTransactions = signal<RecentTransaction[]>([
    { id: 'TX1001', time: '10:45 AM', product: 'Petrol', liters: 45, amount: 29250, paymentMethod: 'POS', status: 'Completed' },
    { id: 'TX1002', time: '10:42 AM', product: 'Diesel', liters: 20, amount: 17000, paymentMethod: 'Cash', status: 'Completed' },
    { id: 'TX1003', time: '10:38 AM', product: 'Petrol', liters: 15, amount: 9750, paymentMethod: 'Transfer', status: 'Pending' },
    { id: 'TX1004', time: '10:30 AM', product: 'Petrol', liters: 32, amount: 20800, paymentMethod: 'POS', status: 'Completed' },
    { id: 'TX1005', time: '10:15 AM', product: 'Diesel', liters: 200, amount: 170000, paymentMethod: 'Transfer', status: 'Completed' },
  ]);

  // --- Computed Metrics ---

  public activePumpsCount = computed(() =>
    this.pumpStatuses().filter(p => p.status === 'Active').length
  );

  public pumpsUnderMaintenanceCount = computed(() =>
    this.pumpStatuses().filter(p => p.status === 'Maintenance').length
  );


  async ngOnInit() {
    // Keep existing store logic for basic station overview
    const stationId = this.managerStore.station()?.id;
    if (stationId) {
      this.stationStore.loadStation(stationId);
    }
  }

  // --- Helpers ---

  getPercentageStyle(percentage: number): string {
    // Returns status color based on fill level
    if (percentage < 20) return 'var(--color-rose-600)'; // Low
    if (percentage > 90) return 'var(--color-teal-600)'; // Full
    return 'var(--color-indigo-600)'; // Normal
  }

  // Format Helpers
  formatNumber(val: number) {
    return val.toLocaleString('en-US');
  }
}
