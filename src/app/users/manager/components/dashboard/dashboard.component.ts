import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit } from '@angular/core';
import { ManagerStore } from '../../store/manager.store';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Legend,
  Title,
  Tooltip
} from 'chart.js';
import { AuthStore } from '../../../../auth/store/auth.store';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Legend,
  Title,
  Tooltip
);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  public managerStore = inject(ManagerStore);
  private authStore = inject(AuthStore)

  constructor() {

  }

  ngOnInit(): void {
    this.managerStore.loadProfile(this.authStore?.userEmail() as string);
  }

}
