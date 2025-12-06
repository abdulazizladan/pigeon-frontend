import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { StationStore } from '../../store/stations.store';
import { CommonModule } from '@angular/common';

interface AssignManagerDialogData {
  stationId: string;
}

const MOCK_MANAGERS = [
  { id: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', name: 'John Doe (MGR)' },
  { id: 'a1b2c3d4-e5f6-7890-1234-567890fedcba', name: 'Jane Doe (MGR)' },
];

@Component({
  selector: 'app-assign-manager',
  standalone: false,
  templateUrl: './assign-manager.html',
  styleUrl: './assign-manager.scss'
})
export class AssignManager {

  private readonly dialogRef = inject(MatDialogRef<AssignManager>);
  private readonly data = inject<AssignManagerDialogData>(MAT_DIALOG_DATA);
  public readonly stationStore = inject(StationStore);

  public managerIdControl = new FormControl<string | null>(null);
  
  // Expose store state for UI
  public isSubmitting = this.stationStore.loading; 
  public stationName = this.stationStore.selectedStation()?.name || 'this station'; 
  public error = this.stationStore.error;

  async onAssign(): Promise<void> {
    const managerId = this.managerIdControl.value;
    const stationId = this.stationStore.selectedStation()?.id;
    console.log("123")

    if (!managerId || !stationId || this.isSubmitting()) {
      console.log(`${stationId} and ${managerId}`)
      return;
    }

    try {
      // The store handles the API call and state update
      await this.stationStore.assignManager(stationId, managerId);
      console.log(`${stationId} and ${managerId}`)
      this.dialogRef.close(true); // Close on success
    } catch (e) {
      // Error handled by store, but close logic is here
      // The error message will show in the template via the `error` signal.
      console.error('Assignment failed:', e);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }


}
