import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StationsService } from '../../../stations-management/services/stations.service';
import { Station } from '../../../stations-management/models/station.model';
import { FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-assign-station-dialog',
    standalone: false,
    templateUrl: './assign-station-dialog.component.html',
    styleUrl: './assign-station-dialog.component.scss'
})
export class AssignStationDialogComponent implements OnInit {

    private readonly stationsService = inject(StationsService);
    private readonly dialogRef = inject(MatDialogRef<AssignStationDialogComponent>);

    stations: Station[] = [];
    loading = false;
    stationControl = new FormControl<string | null>(null, Validators.required);

    ngOnInit(): void {
        this.loadStations();
    }

    async loadStations(): Promise<void> {
        try {
            this.loading = true;
            this.stations = await this.stationsService.getAll();
        } catch (error) {
            console.error('Error loading stations:', error);
        } finally {
            this.loading = false;
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onAssign(): void {
        if (this.stationControl.valid && this.stationControl.value) {
            this.dialogRef.close(this.stationControl.value);
        }
    }
}
