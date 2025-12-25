import { Component, inject, OnInit, effect } from '@angular/core';
import { StationStore } from '../../store/stations.store';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AssignManager } from '../assign-manager/assign-manager';
import { UnassignManager } from '../unassign-manager/unassign-manager';
import { ChartConfiguration, ChartOptions } from 'chart.js';

export interface SalesDataPoint {
  date: string;
  petrolSales: number; // In Naira
  dieselSales: number; // In Naira
}

@Component({
  selector: 'app-station-details',
  standalone: false,
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.scss']
})
export class StationDetailsComponent implements OnInit {

  public stationStore = inject(StationStore);

  // Chart Configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Petrol',
        fill: false,
        tension: 0.1,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
      },
      {
        data: [],
        label: 'Diesel',
        fill: false,
        tension: 0.1,
        borderColor: '#f97316',
        backgroundColor: '#f97316',
        pointBackgroundColor: '#f97316',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { display: false } }, // using display: false instead of drawOnChartArea for simplified type safety if chart.js types are strict
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
    }
  };
  public lineChartLegend = true;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    // Reactive effect to update chart data when store data changes
    effect(() => {
      const sales = this.stationStore.stationSales();
      this.updateChartData(sales);
    });
  }

  // Helper accessor for template compatibility with table
  public get salesData() {
    return this.stationStore.stationSales();
  }

  private updateChartData(sales: any[]) {
    if (!sales) return;

    this.lineChartData = {
      labels: sales.map(s => new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: sales.map(s => s.petrolSales)
        },
        {
          ...this.lineChartData.datasets[1],
          data: sales.map(s => s.dieselSales)
        }
      ]
    };
  }

  ngOnInit(): void {
    // We'll use the 'paramMap' observable for better practice, 
    // especially if the component is reused on route changes.
    this.route.paramMap.pipe(
      take(1) // Only take the first value when the component initializes
    ).subscribe(params => {
      const idParam = params.get('id'); // Get the 'id' parameter as a string
      if (idParam) {
        this.stationStore.loadSelectedStation(idParam)
      }
    });
  }

  openAssignManagerDialog() {
    const stationId = this.stationStore.selectedStation()?.id;
    if (!stationId) {
      console.error("Cannot open assign dialog: Station ID is missing.");
      return;
    }

    const dialogRef = this.dialog.open(AssignManager, {
      width: '400px',
      // Pass the stationId to the dialog
      data: { stationId: stationId }
    });

    // Reload station details if assignment was successful
    dialogRef.afterClosed().subscribe(result => {
      if (result === true && stationId) {
        this.stationStore.loadSelectedStation(stationId);
      }
    });
  }

  openUnassignManagerDialog() {
    const stationId = this.stationStore.selectedStation()?.id;
    if (!stationId) {
      console.error("Cannot open unassign dialog: Station ID is missing.");
      return;
    }

    const dialogRef = this.dialog.open(UnassignManager, {
      width: '400px',
      // Pass the stationId to the dialog
      data: { stationId: stationId }
    });

    // Reload station details if unassignment was successful
    dialogRef.afterClosed().subscribe(result => {
      if (result === true && stationId) {
        this.stationStore.loadSelectedStation(stationId);
      }
    });
  }

}