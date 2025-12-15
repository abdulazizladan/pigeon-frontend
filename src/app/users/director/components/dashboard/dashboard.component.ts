import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { DirectorStore } from '../../store/director.store';
import { SalesPeriod } from '../../services/director.service';
import { ReportService } from '../../../../features/sales-management/services/report.service';
import { ChartData } from 'chart.js';



@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {

  public directorStore = inject(DirectorStore);

  public reportService = inject(ReportService);

  public totalRevenue = signal<number>(0);
  public revenueTrendData: ChartData<'line'> = { labels: [], datasets: [] };
  public weeklyPerformanceData: ChartData<'bar'> = { labels: [], datasets: [] };

  constructor() { }

  ngOnInit() {
    this.directorStore.loadSummary();
    this.loadDirectorDashboardData();
  }

  loadDirectorDashboardData() {
    // Total Revenue
    this.reportService.getTotalRevenue().subscribe({
      next: (data) => this.totalRevenue.set(data.totalSale),
      error: (err) => console.error('Error fetching total revenue', err)
    });

    // Monthly Sales (Trend)
    this.reportService.getMonthlySales().subscribe({
      next: (data) => {
        this.revenueTrendData = {
          labels: data.map(d => d.month),
          datasets: [
            {
              data: data.map(d => d.totalSale),
              label: 'Revenue Trend',
              fill: true,
              tension: 0.4,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)'
            }
          ]
        };
      },
      error: (err) => console.error('Error fetching monthly sales', err)
    });

    // Weekly Sales
    this.reportService.getWeeklySales().subscribe({
      next: (data) => {
        this.weeklyPerformanceData = {
          labels: data.map(d => `Week ${d.week}`),
          datasets: [
            { data: data.map(d => d.totalSale), label: 'Weekly Performance' }
          ]
        };
      },
      error: (err) => console.error('Error fetching weekly sales', err)
    });
  }

  // loadSales method kept for compatibility if needed, but we are using new endpoints now.
  loadSales(period: string) {
    if (!this.directorStore.salesLoading()) {
      this.directorStore.loadSalesRecords(period);
    }
  }

  // Utility function for formatting the date
  formatDate(date: number): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
