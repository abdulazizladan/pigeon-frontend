import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { StationStore } from '../../store/stations.store';
import { CommonModule } from '@angular/common'; 
import { MatButtonModule } from '@angular/material/button';

interface UnassignManagerDialogData {
  stationId: string;
}

@Component({
  selector: 'app-unassign-manager',
  standalone: false,
  templateUrl: './unassign-manager.html',
  styleUrl: './unassign-manager.scss'
})
export class UnassignManager {
  private readonly dialogRef = inject(MatDialogRef<UnassignManager>);
  private readonly data = inject<UnassignManagerDialogData>(MAT_DIALOG_DATA);
  private readonly stationStore = inject(StationStore);

  // Expose store state for UI
  public isSubmitting = this.stationStore.loading; 
  public error = this.stationStore.error;
  public stationName = this.stationStore.selectedStation()?.name || 'this station';

  async onUnassign(): Promise<void> {
    const stationId = this.data.stationId;

    if (!stationId || this.isSubmitting()) {
      return;
    }

    try {
      // The store handles the API call and state update
      await this.stationStore.unassignManager(stationId);
      this.dialogRef.close(true); // Close on success
    } catch (e) {
      // Error handled by store
      console.error('Unassignment failed:', e);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
