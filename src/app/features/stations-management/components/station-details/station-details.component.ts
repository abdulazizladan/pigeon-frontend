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
  ) { }

  public stationStore = inject(StationStore);
  // public id: number = 0; // No longer needed as a property

  // Use the store's sales data signal
  public get salesData() { // Accessor to make template migration easier
    return this.stationStore.stationSales();
  }

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
    const data = this.stationStore.stationSales();
    if (!data || data.length === 0) {
      return [];
    }
    return data.flatMap((point) => [point.petrolSales, point.dieselSales]);
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
    const data = this.stationStore.stationSales();
    if (data.length <= 1) {
      return this.chartMargin.left;
    }
    const t = index / (data.length - 1);
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
    const data = this.stationStore.stationSales();
    if (!data || data.length === 0) {
      return '';
    }
    return data
      .map((d, i) => `${this.indexToX(i)},${this.valueToY(d.petrolSales)}`)
      .join(' ');
  }

  /** Points string for the diesel series polyline */
  public get dieselPoints(): string {
    const data = this.stationStore.stationSales();
    if (!data || data.length === 0) {
      return '';
    }
    return data
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