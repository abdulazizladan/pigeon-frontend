import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Station } from '../../../stations-management/models/station.model';
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

  // --- Data Signals (Initialized empty, populated from Store/API) ---

  // 1. Tank Levels
  public tankLevels = signal<TankLevel[]>([]);

  // 2. Pump Statuses
  public pumpStatuses = signal<PumpStatus[]>([]);

  // 3. Recent Transactions
  public recentTransactions = signal<RecentTransaction[]>([]);
  public displayedColumns: string[] = ['time', 'id', 'product', 'liters', 'amount', 'paymentMethod', 'status'];

  // --- Computed Metrics ---

  public activePumpsCount = computed(() =>
    this.pumpStatuses().filter(p => p.status === 'Active').length
  );

  public pumpsUnderMaintenanceCount = computed(() =>
    this.pumpStatuses().filter(p => p.status === 'Maintenance').length
  );


  async ngOnInit() {
    await this.stationStore.loadMyStation();

    // Update local signals when station data is loaded
    const station = this.stationStore.station();
    if (station) {
      this.updateDashboardData(station);
    }
  }

  private updateDashboardData(station: Station) {
    // Map API data to UI models
    // Note: Using placeholders for data not yet in Station model

    // 1. Tank Levels (Mapping from station volumes)
    this.tankLevels.set([
      {
        product: 'Petrol',
        currentVolume: station.petrolVolume || 0,
        capacity: 33000, // Standard capacity placeholder
        percentage: ((station.petrolVolume || 0) / 33000) * 100
      },
      {
        product: 'Diesel',
        currentVolume: station.dieselVolume || 0,
        capacity: 33000,
        percentage: ((station.dieselVolume || 0) / 33000) * 100
      }
    ]);

    // 2. Pumps (Mapping from station.pumps)
    // Assuming Pump model has status, if not defaulting to 'Idle'
    if (station.pumps && station.pumps.length > 0) {
      const mappedPumps = station.pumps.map((p: any) => ({
        id: p.id,
        number: p.pumpNumber || 0,
        product: p.dispensedProduct === 'PETROL' ? 'Petrol' : 'Diesel' as 'Petrol' | 'Diesel',
        status: (p.status === 'active' ? 'Idle' : 'Maintenance') as any, // Simple mapping
        // currentSession: undefined // No live session data yet
      }));
      this.pumpStatuses.set(mappedPumps);
    }

    // 3. Transactions (Placeholder until Sales API integration)
    // If station.sales exists, map it
    if (station.sales && station.sales.length > 0) {
      // Simple mapping if sales structure matches
      const mappedTx = station.sales.slice(0, 5).map((s: any) => ({
        id: s.id || 'TX...',
        time: new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        product: s.product,
        liters: (s.closingMeterReading - s.openingMeterReading),
        amount: s.totalPrice,
        paymentMethod: 'Cash' as const, // Placeholder
        status: 'Completed' as const
      }));
      this.recentTransactions.set(mappedTx);
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
