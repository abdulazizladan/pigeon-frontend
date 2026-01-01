import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddSaleComponent } from '../add-sale/add-sale.component';
import { SalesService } from '../../services/sales.service';
import { StationsService } from '../../../stations-management/services/stations.service';
import { Station } from '../../../station-management/models/station.model';
import { Chart, registerables, ChartData, ChartType, ChartOptions } from 'chart.js';

Chart.register(...registerables);


/**
 * --- API ENDPOINTS DOCUMENTATION FOR BACKEND DEVELOPER ---
 * 
 * 1. Monthly Sales Comparison
 *    Endpoint: GET /analytics/sales/monthly-comparison
 *    Description: Returns sales totals for the current month and the previous month to calculate performance.
 *    Response Format:
 *    {
 *      "currentMonthTotal": number, // e.g. 5500000
 *      "lastMonthTotal": number,    // e.g. 4800000
 *      "percentageChange": number   // e.g. 14.5 (positive for increase, negative for decrease)
 *    }
 * 
 * 2. 30-Day Sales Trend (Diesel vs Petrol)
 *    Endpoint: GET /analytics/sales/trend/30-days
 *    Description: Returns returns daily sales volume or value breakdown for the last 30 days.
 *    Response Format:
 *    [
 *      { 
 *        "date": "2024-10-01", 
 *        "petrolSales": number, 
 *        "dieselSales": number 
 *      },
 *      ...
 *    ]
 * 
 * 3. Product Comparison (Cumulative)
 *    Endpoint: GET /analytics/sales/product-comparison
 *    Description: Returns cumulative sales volume for Petrol vs Diesel for the current period (e.g., this month).
 *    Response Format:
 *    {
 *      "petrolTotalVolume": number,
 *      "dieselTotalVolume": number
 *    }
 * 
 * 4. Station Performance Rankings (Yesterday)
 *    Endpoint: GET /analytics/stations/performance/yesterday
 *    Description: Returns the top 3 best selling and bottom 3 least selling stations based on yesterday's sales.
 *    Response Format:
 *    {
 *      "top3": [
 *         { "stationId": "uuid", "stationName": "Station A", "totalSales": number },
 *         ...
 *      ],
 *      "bottom3": [
 *         { "stationId": "uuid", "stationName": "Station B", "totalSales": number },
 *         ...
 *      ]
 *    }
 */



@Component({
  selector: 'app-sales-dashboard',
  standalone: false,
  templateUrl: './sales-dashboard.component.html',
  styleUrl: './sales-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesDashboardComponent implements OnInit {

  private dialog = inject(MatDialog);
  private salesService = inject(SalesService);
  private stationsService = inject(StationsService); // Inject StationsService
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // --- Signals for State Management ---
  myStation = signal<Station | null>(null);
  stationSummary = signal<any>(null);
  totalSales = signal<number>(0);
  dailySalesHistory = signal<{ date: string, totalSales: number }[]>([]);
  cumulativeSales = signal<{ date: string, totalSales: number }[]>([]);
  weeklySales = signal<{ week: number, totalSale: number }[]>([]);
  monthlySales = signal<{ month: string, totalSale: number }[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);





  // --- Computed Properties ---

  // Station name for display
  stationName = computed(() => this.myStation()?.name || 'Loading...');

  // Average daily sales
  averageDailySales = computed(() => {
    const history = this.dailySalesHistory();
    if (history.length === 0) return 0;
    const total = history.reduce((sum, day) => sum + day.totalSales, 0);
    return total / history.length;
  });

  // Current time period selection




  // Today's Sales Helper Signals
  todaySalesList = signal<any[]>([]);

  todayPetrolSales = computed(() => {
    return this.todaySalesList()
      .filter(s => s.product === 'PMS' || s.product === 'Petrol') // Adjust checks based on actual enum/data
      .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  });

  todayDieselSales = computed(() => {
    return this.todaySalesList()
      .filter(s => s.product === 'AGO' || s.product === 'Diesel')
      .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  });

  todayTotalSales = computed(() => {
    return this.todaySalesList()
      .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  });

  // --- Chart Configurations ---

  // Line Chart for 30-Day Sales History
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Date' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Sales (₦)' },
        ticks: {
          callback: (value) => '₦' + (value as number).toLocaleString()
        }
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (item) => `Sales: ₦${(item.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    }
  };

  dailySalesChartData = computed<ChartData<'line'>>(() => {
    const data = this.dailySalesHistory();
    return {
      labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: data.map(d => d.totalSales),
        label: '30-Day Sales',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        fill: true,
        tension: 0.4
      }]
    };
  });

  // Area Chart for Cumulative Sales
  areaChartType: ChartType = 'line';
  areaChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Date' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Cumulative Sales (₦)' },
        ticks: {
          callback: (value) => '₦' + (value as number).toLocaleString()
        }
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (item) => `Total: ₦${(item.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    }
  };

  cumulativeSalesChartData = computed<ChartData<'line'>>(() => {
    const data = this.cumulativeSales();
    return {
      labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: data.map(d => d.totalSales),
        label: 'Cumulative Sales',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981',
        fill: true,
        tension: 0.4
      }]
    };
  });

  // Bar Chart for Weekly/Monthly Sales
  barChartType: ChartType = 'bar';
  barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Sales (₦)' },
        ticks: {
          callback: (value) => '₦' + (value as number).toLocaleString()
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item) => `Sales: ₦${(item.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        }
      }
    }
  };

  monthlySalesChartData = computed<ChartData<'bar'>>(() => {
    const data = this.monthlySales();
    return {
      labels: data.map(d => {
        const [year, month] = d.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        data: data.map(d => d.totalSale),
        label: 'Monthly Sales',
        backgroundColor: '#8b5cf6',
        hoverBackgroundColor: '#7c3aed'
      }]
    };
  });

  // --- Lifecycle ---

  async ngOnInit() {
    await this.loadDashboardData();
  }

  // --- Data Loading ---

  async loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Fetch logged-in user's station
      let station: Station | null = null;

      try {
        station = await this.stationsService.getMine();
        console.log('✅ Fetched station:', station); // Debug log
      } catch (apiErr: any) {
        console.error('❌ Error fetching station from API:', apiErr);

        // Check if it's a 404 or specific error
        if (apiErr.status === 404) {
          this.error.set('No station has been assigned to your account. Please contact your administrator.');
        } else if (apiErr.status === 401 || apiErr.status === 403) {
          this.error.set('You do not have permission to view this dashboard. Please log in as a station manager.');
        } else {
          this.error.set(`Failed to load station data: ${apiErr.message || 'Unknown error'}`);
        }
        this.loading.set(false); // CRITICAL: Set loading to false before returning
        return; // Exit early
      }

      if (!station) {
        this.error.set('No station assigned to this user. Please contact your administrator.');
        this.loading.set(false); // CRITICAL: Set loading to false before returning
        return; // Exit early
      }

      this.myStation.set(station);
      console.log('✅ Station set in signal:', this.myStation());

      // Only fetch additional data if station has an ID
      if (station.id) {
        try {
          console.log('📊 Fetching dashboard data for station:', station.id);

          // Fetch all dashboard data in parallel
          const [summary, revenue, dailyHistory, cumulative, weekly, monthly, allSales] = await Promise.all([
            this.stationsService.getSummary(station.id).catch((err) => {
              console.warn('⚠️ Summary fetch failed:', err);
              return null;
            }),
            this.salesService.getStationTotalRevenue(station.id).catch((err) => {
              console.warn('⚠️ Total revenue fetch failed:', err);
              return { totalSale: 0 };
            }),
            this.salesService.getStationDailySalesHistory(station.id).catch((err) => {
              console.warn('⚠️ Daily history fetch failed:', err);
              return [];
            }),
            this.salesService.getStationCumulativeSales(station.id).catch((err) => {
              console.warn('⚠️ Cumulative sales fetch failed:', err);
              return [];
            }),
            this.salesService.getWeeklySales().catch((err) => {
              console.warn('⚠️ Weekly sales fetch failed:', err);
              return [];
            }),
            this.salesService.getMonthlySales().catch((err) => {
              console.warn('⚠️ Monthly sales fetch failed:', err);
              return [];
            }),
            this.salesService.getSalesByStationId(station.id).catch((err) => {
              console.warn('⚠️ Sales list fetch failed:', err);
              return [];
            })
          ]);

          console.log('📊 Dashboard data fetched:', { summary, revenue, dailyHistory, cumulative, weekly, monthly });

          this.stationSummary.set(summary);
          this.totalSales.set(revenue.totalSale || 0);
          this.dailySalesHistory.set(dailyHistory);
          this.cumulativeSales.set(cumulative);
          this.weeklySales.set(weekly);
          this.monthlySales.set(monthly);

          // Filter for today's sales
          const today = new Date();
          const todayString = today.toDateString();
          const todaysSalesRaw = allSales.filter((s: any) => new Date(s.createdAt).toDateString() === todayString);
          this.todaySalesList.set(todaysSalesRaw);

          console.log('✅ All signals updated successfully');
        } catch (dataErr) {
          console.warn('⚠️ Some dashboard data could not be loaded:', dataErr);
          // Continue anyway - station info will still display
        }
      } else {
        console.warn('⚠️ Station ID is missing, skipping additional data fetch');
      }

    } catch (err: any) {
      console.error('❌ Error loading dashboard data:', err);
      this.error.set(err.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      this.loading.set(false);
      console.log('🏁 Loading complete. loading:', this.loading(), 'error:', this.error());
    }
  }

  // --- Actions ---

  openSalesDialog() {
    const dialogRef = this.dialog.open(AddSaleComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload data after adding a sale
        this.loadDashboardData();
      }
    });
  }



  formatCurrency(value: number): string {
    return '₦' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatDate(value: number | string | Date | undefined): string {
    if (!value) return 'N/A';
    const date = value instanceof Date ? value : (typeof value === 'number' ? new Date(value) : new Date(value));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
