import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

// ng2-charts and Chart.js imports (keep these in the component file for logic/types)
import { Chart, registerables, ChartData, ChartType, ChartOptions } from 'chart.js';

Chart.register(...registerables);

interface SalesRecord {
  stationId: string;
  stationName: string;
  date: string; // YYYY-MM-DD
  petrolVolume: number; // Litres
  dieselVolume: number; // Litres
  petrolPrice: number; // NGN/L
  dieselPrice: number; // NGN/L
}

interface StationSummary {
  stationId: string;
  stationName: string;
  totalRevenueNGN: number;
}

const MOCK_SALES_DATA: SalesRecord[] = [
  { stationId: 'S001', stationName: 'Lagos Main', date: '2025-10-25', petrolVolume: 5000, dieselVolume: 3500, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S002', stationName: 'Abuja West', date: '2025-10-25', petrolVolume: 3000, dieselVolume: 1500, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S003', stationName: 'P/Harcourt East', date: '2025-10-25', petrolVolume: 1500, dieselVolume: 4000, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S001', stationName: 'Lagos Main', date: '2025-10-26', petrolVolume: 5500, dieselVolume: 3200, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S002', stationName: 'Abuja West', date: '2025-10-26', petrolVolume: 3200, dieselVolume: 1800, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S003', stationName: 'P/Harcourt East', date: '2025-10-26', petrolVolume: 1800, dieselVolume: 4500, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S004', stationName: 'Kano North', date: '2025-10-26', petrolVolume: 800, dieselVolume: 100, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S001', stationName: 'Lagos Main', date: '2025-10-27', petrolVolume: 6000, dieselVolume: 3000, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S002', stationName: 'Abuja West', date: '2025-10-27', petrolVolume: 3500, dieselVolume: 1600, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S003', stationName: 'P/Harcourt East', date: '2025-10-27', petrolVolume: 2000, dieselVolume: 4200, petrolPrice: 700, dieselPrice: 850 },
  { stationId: 'S004', stationName: 'Kano North', date: '2025-10-27', petrolVolume: 1200, dieselVolume: 200, petrolPrice: 700, dieselPrice: 850 },
  // Adding more data to make S004 and S005 appear as least performers
  { stationId: 'S005', stationName: 'Ibadan South', date: '2025-10-27', petrolVolume: 500, dieselVolume: 300, petrolPrice: 700, dieselPrice: 850 },
];

@Component({
  selector: 'app-summary',
  standalone: false,
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Summary {

  // --- Signals and Reactive State ---
  private salesData = signal<SalesRecord[]>(MOCK_SALES_DATA);
  public filterForm = new FormBuilder().group({
    stationId: ['all'], // 'all' or specific stationId
  });

  // Inject MatSnackBar as it is used for notifications
  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Listen for filter changes and re-calculate computed values
    this.filterForm.controls.stationId.valueChanges.subscribe(() => {
      // Signals handle implicit updates
    });
  }

  // --- Computed State (Derived Data) ---

  // All unique stations for the filter dropdown
  public allStations = computed(() => {
    const stationsMap = new Map<string, { stationId: string, stationName: string }>();
    this.salesData().forEach(record => {
      if (!stationsMap.has(record.stationId)) {
        stationsMap.set(record.stationId, { stationId: record.stationId, stationName: record.stationName });
      }
    });
    return Array.from(stationsMap.values()).sort((a, b) => a.stationName.localeCompare(b.stationName));
  });

  // Filtered sales data
  private filteredData = computed(() => {
    const data = this.salesData();
    const stationId = this.filterForm.controls.stationId.value;

    if (stationId === 'all') {
      return data;
    }
    return data.filter(record => record.stationId === stationId);
  });

  // Total Revenue NGN
  public totalRevenue = computed(() => {
    return this.filteredData().reduce((sum, record) => {
      const petrolRevenue = record.petrolVolume * record.petrolPrice;
      const dieselRevenue = record.dieselVolume * record.dieselPrice;
      return sum + petrolRevenue + dieselRevenue;
    }, 0);
  });

  // Station Ranking Summary
  private stationSummaries = computed<StationSummary[]>(() => {
    const summaryMap = new Map<string, { stationId: string, stationName: string, totalRevenueNGN: number }>();
    this.filteredData().forEach(record => {
      const revenue = (record.petrolVolume * record.petrolPrice) + (record.dieselVolume * record.dieselPrice);
      const existing = summaryMap.get(record.stationId);

      if (existing) {
        existing.totalRevenueNGN += revenue;
      } else {
        summaryMap.set(record.stationId, {
          stationId: record.stationId,
          stationName: record.stationName,
          totalRevenueNGN: revenue
        });
      }
    });

    return Array.from(summaryMap.values());
  });

  // Top 3 Stations
  public topStations = computed(() => {
    return this.stationSummaries()
      .slice()
      .sort((a, b) => b.totalRevenueNGN - a.totalRevenueNGN)
      .slice(0, 3);
  });

  // Least 3 Stations (Excluding those in the top list, if more than 3 total)
  public leastStations = computed(() => {
    const summaries = this.stationSummaries();
    if (summaries.length <= 3) return summaries;

    return summaries
      .slice()
      .sort((a, b) => a.totalRevenueNGN - b.totalRevenueNGN)
      .slice(0, 3);
  });


  // --- Chart Data and Options (Same as before) ---

  // 1. Product Revenue Comparison (Bar Chart)
  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Revenue (NGN)' },
        ticks: { callback: (value) => '₦' + (value as number).toLocaleString() }
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ₦${(item.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` } }
    }
  };

  public productRevenueChartData = computed<ChartData<'bar'>>(() => {
    const data = this.filteredData();
    const totalPetrolRevenue = data.reduce((sum, r) => sum + r.petrolVolume * r.petrolPrice, 0);
    const totalDieselRevenue = data.reduce((sum, r) => sum + r.dieselVolume * r.dieselPrice, 0);

    return {
      labels: ['Fuel Products'],
      datasets: [
        { data: [totalPetrolRevenue], label: 'Petrol (NGN)', backgroundColor: '#3b82f6', hoverBackgroundColor: '#2563eb' },
        { data: [totalDieselRevenue], label: 'Diesel (NGN)', backgroundColor: '#ef4444', hoverBackgroundColor: '#dc2626' }
      ]
    };
  });

  // 2. Recent Sales Trend (Line Chart)
  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Total Daily Revenue (NGN)' },
        ticks: { callback: (value) => '₦' + (value as number).toLocaleString() }
      }
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ₦${(item.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` } }
    }
  };

  public salesTrendChartData = computed<ChartData<'line'>>(() => {
    const dailySalesMap = new Map<string, { petrol: number, diesel: number }>();
    this.filteredData().forEach(record => {
      const date = record.date;
      const petrolRevenue = record.petrolVolume * record.petrolPrice;
      const dieselRevenue = record.dieselVolume * record.dieselPrice;

      const daily = dailySalesMap.get(date) || { petrol: 0, diesel: 0 };
      daily.petrol += petrolRevenue;
      daily.diesel += dieselRevenue;
      dailySalesMap.set(date, daily);
    });

    const dates = Array.from(dailySalesMap.keys()).sort();
    const petrolData = dates.map(date => dailySalesMap.get(date)!.petrol);
    const dieselData = dates.map(date => dailySalesMap.get(date)!.diesel);
    const totalData = dates.map(date => dailySalesMap.get(date)!.petrol + dailySalesMap.get(date)!.diesel);

    return {
      labels: dates,
      datasets: [
        {
          data: totalData,
          label: 'Total Revenue',
          borderColor: '#10b981', // Emerald green
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#10b981',
          fill: false,
          tension: 0.3
        },
        {
          data: petrolData,
          label: 'Petrol Revenue',
          borderColor: '#3b82f6', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: 'origin',
          tension: 0.3
        },
        {
          data: dieselData,
          label: 'Diesel Revenue',
          borderColor: '#ef4444', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: 'origin',
          tension: 0.3
        }
      ]
    };
  });


  // --- Export Functionality (Same as before) ---

  exportData(): void {
    const dataToExport = this.filteredData();
    if (dataToExport.length === 0) {
      this.snackBar.open('No data to export for the current filter.', 'Dismiss', { duration: 3000 });
      return;
    }

    // Prepare CSV content (Headers first)
    const headers = ["Station ID", "Station Name", "Date", "Petrol Volume (L)", "Diesel Volume (L)", "Petrol Price (NGN)", "Diesel Price (NGN)", "Total Revenue (NGN)"];
    const rows = dataToExport.map(r => {
      const totalRevenue = (r.petrolVolume * r.petrolPrice) + (r.dieselVolume * r.dieselPrice);
      return [
        r.stationId,
        r.stationName,
        r.date,
        r.petrolVolume,
        r.dieselVolume,
        r.petrolPrice,
        r.dieselPrice,
        totalRevenue
      ].join(',');
    });

    const csvContent = headers.join(',') + '\n' + rows.join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'sales_performance_report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.snackBar.open('Sales data successfully exported to CSV!', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('Download not supported in this browser environment.', 'Close', { duration: 3000 });
    }
  }
  
}
