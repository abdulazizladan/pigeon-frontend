import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ManagerStore } from '../../store/manager.store';
import { ReportService } from '../../../../features/sales-management/services/report.service';
import { ChartData } from 'chart.js';
import { AuthStore } from '../../../../auth/store/auth.store';



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

  public reportService = inject(ReportService);

  public totalRevenue = signal<number>(0);
  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  constructor() {

  }

  ngOnInit(): void {
    this.managerStore.loadProfile(this.authStore?.userEmail() as string);
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.reportService.getTotalRevenue().subscribe({
      next: (data) => this.totalRevenue.set(data.totalSale),
      error: (err) => console.error('Error fetching total revenue', err)
    });

    this.reportService.getWeeklySales().subscribe({
      next: (data) => {
        this.chartData = {
          labels: data.map(d => `Week ${d.week}`),
          datasets: [
            { data: data.map(d => d.totalSale), label: 'Weekly Sales' }
          ]
        };
      },
      error: (err) => console.error('Error fetching weekly sales', err)
    });
  }
}
