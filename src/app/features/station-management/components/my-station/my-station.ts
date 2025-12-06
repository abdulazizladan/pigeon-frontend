import { Component, inject, OnInit } from '@angular/core';
import { Station } from '../../models/station.model';
import { StationStore } from '../../store/station.store';
import { ManagerStore } from '../../../../users/manager/store/manager.store';

@Component({
  selector: 'app-my-station',
  standalone: false,
  templateUrl: './my-station.html',
  styleUrl: './my-station.scss'
})
export class MyStation implements OnInit {

  public stationStore = inject(StationStore);
  public managerStore = inject(ManagerStore);

  async ngOnInit() {
    const stationId = this.managerStore.station()?.id;
    if (stationId) {
      this.stationStore.loadStation(stationId);
    }
  }

  // Getter for station from manager store
  get station(): Station | null {
    return this.managerStore.station();
  }

  // Getter for loading state from manager store
  get loading(): boolean {
    return this.managerStore.loading();
  }

  // Getter for error state from manager store
  get error(): string | null {
    return this.managerStore.error();
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPumpProductBadgeColor(product: string): string {
    switch (product.toLowerCase()) {
      case 'petrol':
        return 'primary';
      case 'diesel':
        return 'accent';
      default:
        return '';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
      case 'operational':
        return '#10b981'; // green
      case 'inactive':
      case 'maintenance':
        return '#f59e0b'; // amber
      case 'suspended':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  }
}
