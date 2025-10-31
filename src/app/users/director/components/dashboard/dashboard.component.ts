import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit } from '@angular/core';
import { DirectorStore } from '../../store/director.store';
import { SalesPeriod } from '../../services/director.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit{

  // We use a simplified class for the store here, as we can't inject a real NGRX store in isolation
  public directorStore = new DirectorStore();

  // Reference to the Chart.js instance
  private chartInstance: Chart | null = null;
  
  // Computed signal to transform store data into Chart.js format
  public chartData = computed(() => {
    const records = this.directorStore.salesRecords();
    const period = this.directorStore.currentSalesPeriod();
    const periodName = period.charAt(0).toUpperCase() + period.slice(1);
    
    return {
      labels: records.map(r => r.label),
      datasets: [
        {
          label: 'Petrol Sales',
          data: records.map(r => r.petrolSales),
          borderColor: 'rgba(75, 192, 192, 1)', // Blue-green
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
        {
          label: 'Diesel Sales',
          data: records.map(r => r.dieselSales),
          borderColor: 'rgba(255, 159, 64, 1)', // Orange
          backgroundColor: 'rgba(255, 159, 64, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        }
      ]
    };
  });

  // Use constructor to set up the effect to react to signal changes
  constructor() {
    // The effect runs whenever any of its dependencies (salesRecords, salesLoading) change.
    effect(() => {
      // We only attempt to render the chart when loading is false and data is available.
      if (!this.directorStore.salesLoading() && this.directorStore.salesRecords().length > 0) {
        // FIX: Added a 50ms timeout to ensure the canvas element has been rendered 
        // by the change detection cycle before Chart.js tries to find it.
        //setTimeout(() => this.renderChart(), 50); 
        this.renderChart()
      }
    });
  }

  ngOnInit() {
    // 1. Load Station Summary Data
    this.directorStore.loadSummary();
    
    // 2. Load Sales Data for the default 'daily' period
    this.directorStore.loadSalesRecords('daily');
    
    // 3. Set up an effect for sales data changes to update the chart
    effect(() => {
      // Accessing the signal will cause this effect to rerun when salesRecords changes
      this.directorStore.salesRecords();
      this.renderChart();
    });
  }
  /**
   * Calls the store method to fetch sales data for a specific period.
   * @param period The aggregation period ('daily', 'weekly', or 'monthly').
   */
  loadSales(period: string) {
    if (!this.directorStore.salesLoading()) {
      this.directorStore.loadSalesRecords(period);
    }
  }

  /**
   * Renders or updates the Chart.js instance.
   */
  private async renderChart() {
    // Dynamically import Chart.js from the CDN. This waits for the library to load 
    // before the Chart constructor is accessed, fixing the TypeError.
    const { Chart } = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js' as any);
    
    const data = this.chartData();
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    
    if (!ctx) return;

    // Destroy existing chart instance if it exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Chart.js configuration
    // Use the dynamically imported 'Chart' constructor
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Sales Trend (' + this.directorStore.currentSalesPeriod().toUpperCase() + ' View)'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Volume Sold'
            }
          },
          x: {
             // Ensures labels for dates/periods are displayed clearly
          }
        }
      }
    });
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
