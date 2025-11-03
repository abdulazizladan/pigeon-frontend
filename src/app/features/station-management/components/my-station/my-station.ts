import { Component, inject, OnInit, signal } from '@angular/core';
import { ManagerService } from '../../../../users/manager/services/manager.service';
import { Station } from '../../models/station.model';
import { StationStore } from '../../store/station.store';

@Component({
  selector: 'app-my-station',
  standalone: false,
  templateUrl: './my-station.html',
  styleUrl: './my-station.scss'
})
export class MyStation implements OnInit {

  private managerService = inject(ManagerService);
  public stationStore = inject(StationStore);

  station = signal<Station | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async ngOnInit() {
    await this.loadStation();
    this.stationStore.loadStation("041f6c88-a267-40e2-bdcf-f5a9033db3e5");
  }

  async loadStation() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const stationData = await this.managerService.getMyStation();
      this.station.set(stationData);
    } catch (err) {
      console.error('Error loading station:', err);
      this.error.set('Failed to load station data. Please check your connection and try again.');
    } finally {
      this.loading.set(false);
    }
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
