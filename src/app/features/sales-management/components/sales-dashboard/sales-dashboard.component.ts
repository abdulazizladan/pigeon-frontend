import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddSaleComponent } from '../add-sale/add-sale.component';
import { SalesService } from '../../services/sales.service';
import { Chart, registerables, ChartData, ChartType, ChartOptions, ChartConfiguration } from 'chart.js';
import { StationsService } from '../../../stations-management/services/stations.service'; // Import StationsService
import { Station } from '../../../stations-management/models/station.model'; // Import Station model

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

// --- Interfaces ---

interface MonthlyComparison {
  currentMonthTotal: number;
  lastMonthTotal: number;
  percentageChange: number;
}

interface DailySales {
  date: string;
  petrolSales: number;
  dieselSales: number;
}

interface ProductComparison {
  petrolTotalVolume: number;
  dieselTotalVolume: number;
}

interface StationRanking {
  stationId: string;
  stationName: string;
  totalSales: number;
}

interface WeeklySalesTrend {
  week: number;
  totalSale: number;
}

interface MonthlySalesTrend {
  month: string;
  totalSale: number;
}

interface StationSales {
  stationId: string;
  stationName: string;
  totalSales: number;
}

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
  totalSales = signal<number>(0);
  weeklySales = signal<WeeklySalesTrend[]>([]);
  monthlySales = signal<MonthlySalesTrend[]>([]);
  stations = signal<Station[]>([]); // Signal for real stations
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // --- Filter Form ---
  filterForm = this.fb.group({
    stationId: ['all'],
    timePeriod: ['monthly'] // 'weekly' or 'monthly'
  });

  // --- Mock Data (Replace with API calls when backend is ready) ---
  private mockWeeklySales: WeeklySalesTrend[] = [
    { week: 40, totalSale: 950000 },
    { week: 41, totalSale: 1100000 },
    { week: 42, totalSale: 1050000 },
    { week: 43, totalSale: 1200000 },
    { week: 44, totalSale: 1150000 },
    { week: 45, totalSale: 1300000 },
    { week: 46, totalSale: 1250000 },
    { week: 47, totalSale: 1400000 }
  ];

  private mockMonthlySales: MonthlySalesTrend[] = [
    { month: '2024-05', totalSale: 3800000 },
    { month: '2024-06', totalSale: 4200000 },
    { month: '2024-07', totalSale: 4500000 },
    { month: '2024-08', totalSale: 4100000 },
    { month: '2024-09', totalSale: 4800000 },
    { month: '2024-10', totalSale: 5200000 },
    { month: '2024-11', totalSale: 5500000 }
  ];

  private mockStationSales: StationSales[] = [
    { stationId: 'S001', stationName: 'Lagos Main', totalSales: 2500000 },
    { stationId: 'S002', stationName: 'Abuja West', totalSales: 1800000 },
    { stationId: 'S003', stationName: 'P/Harcourt East', totalSales: 2100000 },
    { stationId: 'S004', stationName: 'Kano North', totalSales: 900000 },
    { stationId: 'S005', stationName: 'Ibadan South', totalSales: 700000 }
  ];

  // --- Computed Properties ---

  // Available stations for filter
  allStations = computed(() => {
    // Map real stations to dropdown options. Check if stations exist, otherwise fallback to mock (or just empty)
    if (this.stations().length > 0) {
      return this.stations().map(s => ({ id: s.id || '', name: s.name }));
    }
    return this.mockStationSales.map(s => ({ id: s.stationId, name: s.stationName }));
  });

  // Current time period selection
  currentTimePeriod = computed(() => this.filterForm.controls.timePeriod.value || 'monthly');

  // Sales trend data based on selected time period
  salesTrendData = computed(() => {
    const period = this.currentTimePeriod();
    if (period === 'weekly') {
      return this.weeklySales();
    }
    return this.monthlySales();
  });

  // --- Chart Configurations ---

  // Line Chart for Sales Trends
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Period' },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Total Sales (₦)' },
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

  salesTrendChartData = computed<ChartData<'line'>>(() => {
    const period = this.currentTimePeriod();

    if (period === 'weekly') {
      const data = this.weeklySales();
      return {
        labels: data.map(d => `Week ${d.week}`),
        datasets: [{
          data: data.map(d => d.totalSale),
          label: 'Weekly Sales',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10b981',
          fill: true,
          tension: 0.4
        }]
      };
    } else {
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
    }
  });

  // Bar Chart for Station Comparison
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
        title: { display: true, text: 'Total Sales (₦)' },
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

  stationComparisonChartData = computed<ChartData<'bar'>>(() => {
    const stationId = this.filterForm.controls.stationId.value;
    let data = this.mockStationSales;

    // Filter by station if not 'all'
    if (stationId && stationId !== 'all') {
      data = data.filter(s => s.stationId === stationId);
    }

    return {
      labels: data.map(s => s.stationName),
      datasets: [{
        data: data.map(s => s.totalSales),
        label: 'Station Sales',
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ],
        hoverBackgroundColor: [
          '#059669',
          '#2563eb',
          '#d97706',
          '#dc2626',
          '#7c3aed'
        ]
      }]
    };
  });

  // --- Lifecycle ---

  async ngOnInit() {
    await this.loadDashboardData();

    // Listen for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      // Signals will auto-update computed properties
    });
  }

  // --- Data Loading ---

  async loadDashboardData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // TODO: Replace with actual API calls when backend is ready
      // const totalSalesData = await this.salesService.getTotalSales();
      // const weeklyData = await this.salesService.getWeeklySales();
      // const monthlyData = await this.salesService.getMonthlySales();

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      this.totalSales.set(5500000);
      this.weeklySales.set(this.mockWeeklySales);
      this.monthlySales.set(this.mockMonthlySales);

      // Fetch real stations
      const realStations = await this.stationsService.getAll();
      this.stations.set(realStations);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      this.error.set('Failed to load dashboard data. Please try again.');
    } finally {
      this.loading.set(false);
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

  exportData() {
    const period = this.currentTimePeriod();
    const data = period === 'weekly' ? this.weeklySales() : this.monthlySales();

    if (data.length === 0) {
      this.snackBar.open('No data to export', 'Dismiss', { duration: 3000 });
      return;
    }

    // Prepare CSV
    const headers = period === 'weekly'
      ? ['Week', 'Total Sales (NGN)']
      : ['Month', 'Total Sales (NGN)'];

    const rows = data.map(d => {
      const label = period === 'weekly' ? (d as WeeklySalesTrend).week : (d as MonthlySalesTrend).month;
      return [label, d.totalSale].join(',');
    });

    const csvContent = headers.join(',') + '\n' + rows.join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_${period}_report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Data exported successfully!', 'Close', { duration: 3000 });
  }

  formatCurrency(value: number): string {
    return '₦' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
