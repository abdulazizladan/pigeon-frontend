import { Component, inject, OnInit } from '@angular/core'; // Added OnInit
import { StationStore } from '../../store/stations.store';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators'; // Optional: for good practice with router params
import { MatDialog } from '@angular/material/dialog';
import { AssignManager } from '../assign-manager/assign-manager';
import { UnassignManager } from '../unassign-manager/unassign-manager';

export interface SalesDataPoint {
  date: string;
  petrolSales: number; // In Naira
  dieselSales: number; // In Naira
}

@Component({
  selector: 'app-station-details',
  standalone: false,
  templateUrl: './station-details.component.html',
  // NOTE: Angular expects `styleUrls` (plural) with an array
  styleUrls: ['./station-details.component.scss']
})
export class StationDetailsComponent implements OnInit { // Implemented OnInit

  // Injecting ActivatedRoute via constructor for compatibility, 
  // though it could be injected via the 'inject' function as well.
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  public stationStore = inject(StationStore);
  // public id: number = 0; // No longer needed as a property

  // Dummy Sales Data for Line Graph
  public salesData: SalesDataPoint[] = [
    { date: '2025-01-01', petrolSales: 800000, dieselSales: 500000 },
    { date: '2025-01-02', petrolSales: 950000, dieselSales: 620000 },
    { date: '2025-01-03', petrolSales: 1100000, dieselSales: 700000 },
    { date: '2025-01-04', petrolSales: 750000, dieselSales: 480000 },
    { date: '2025-01-05', petrolSales: 880000, dieselSales: 550000 },
  ];

  // Simple SVG chart config
  public chartWidth: number = 640;
  public chartHeight: number = 300;
  public chartMargin: { top: number; right: number; bottom: number; left: number } = {
    top: 16,
    right: 16,
    bottom: 28,
    left: 56,
  };

  /** Inner drawable width excluding margins */
  public get innerWidth(): number {
    return Math.max(0, this.chartWidth - this.chartMargin.left - this.chartMargin.right);
  }

  /** Inner drawable height excluding margins */
  public get innerHeight(): number {
    return Math.max(0, this.chartHeight - this.chartMargin.top - this.chartMargin.bottom);
  }

  /** Collect all numeric values for y-domain computation */
  private get allValues(): number[] {
    if (!this.salesData || this.salesData.length === 0) {
      return [];
    }
    return this.salesData.flatMap((point: SalesDataPoint) => [point.petrolSales, point.dieselSales]);
  }

  /** Minimum y value, safe default when data is empty */
  public get yMin(): number {
    return this.allValues.length > 0 ? Math.min(...this.allValues) : 0;
  }

  /** Maximum y value, safe default when data is empty */
  public get yMax(): number {
    return this.allValues.length > 0 ? Math.max(...this.allValues) : 1;
  }

  /** Map a data index to an x coordinate within the inner chart area */
  public indexToX(index: number): number {
    if (this.salesData.length <= 1) {
      return this.chartMargin.left;
    }
    const t = index / (this.salesData.length - 1);
    return this.chartMargin.left + t * this.innerWidth;
  }

  /** Map a data value to a y coordinate within the inner chart area */
  public valueToY(value: number): number {
    const range = this.yMax - this.yMin || 1; // avoid division by zero
    const t = (value - this.yMin) / range; // 0..1
    // Invert for SVG (0 at top)
    return this.chartMargin.top + (1 - t) * this.innerHeight;
  }

  /** Points string for the petrol series polyline */
  public get petrolPoints(): string {
    if (!this.salesData || this.salesData.length === 0) {
      return '';
    }
    return this.salesData
      .map((d, i) => `${this.indexToX(i)},${this.valueToY(d.petrolSales)}`)
      .join(' ');
  }

  /** Points string for the diesel series polyline */
  public get dieselPoints(): string {
    if (!this.salesData || this.salesData.length === 0) {
      return '';
    }
    return this.salesData
      .map((d, i) => `${this.indexToX(i)},${this.valueToY(d.dieselSales)}`)
      .join(' ');
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
    const dialogRaf = this.dialog.open(AssignManager, {
      width: '400px'
    })
  }

  openUnassignManagerDialog() {
    const dialogRaf = this.dialog.open(UnassignManager, {
      width: '400px'
    })
  }

}