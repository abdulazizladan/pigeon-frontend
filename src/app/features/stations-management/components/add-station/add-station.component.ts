// add-station.component.ts (Corrected)

import { Component, inject } from '@angular/core';
// Import FormArray
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms'; 
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StationStore } from '../../store/stations.store';

@Component({
  selector: 'app-add-station',
  standalone: false,
  templateUrl: './add-station.component.html',
  styleUrl: './add-station.component.scss'
})
export class AddStationComponent {

  public stationStore = inject(StationStore);
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddStationComponent>)
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Define the list of possible products for pumps
  readonly productOptions = ['PETROL', 'DIESEL', 'KERO']; 

  // --- FORM INITIALIZATION (Must be defined first) ---
  stationForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    ward: ['', Validators.required],
    lga: ['', Validators.required],
    state: ['Kaduna', Validators.required],
    longitude: [0, Validators.required],
    latitude: [0, Validators.required],
    // --- Fields for Stock and Manager ---
    managerId: [''],
    petrolVolume: [0, [Validators.required, Validators.min(0)]],
    petrolPricePerLiter: [0, [Validators.required, Validators.min(0)]],
    dieselVolume: [0, [Validators.required, Validators.min(0)]],
    dieselPricePerLiter: [0, [Validators.required, Validators.min(0)]],
    pricePerLiter: [0, [Validators.required, Validators.min(0)]], 
    // FIX: Call createPumpFormGroup(1) directly to avoid accessing the 'pumps' getter
    pumps: this.fb.array([this.createPumpFormGroup(1)]) 
  });

  // Getter to easily access the pumps FormArray in the template
  get pumps(): FormArray {
    // This now works because stationForm is fully constructed.
    return this.stationForm.get('pumps') as FormArray; 
  }

  /**
   * Creates a FormGroup for a single pump entry.
   * @param initialNumber - The pump number to assign (defaults to 1).
   */
  createPumpFormGroup(initialNumber: number = 1): FormGroup {
    // FIX: Use the passed initialNumber instead of calculating it from 'this.pumps.length'
    return this.fb.group({
      pumpNumber: [initialNumber, [Validators.required, Validators.min(1)]], 
      dispensedProduct: ['', Validators.required] 
    });
  }

  /**
   * Adds a new pump FormGroup to the pumps FormArray.
   */
  addPump(): void {
    // Now that the form is initialized, we can safely use this.pumps.length
    const nextPumpNumber = this.pumps.length + 1;
    this.pumps.push(this.createPumpFormGroup(nextPumpNumber));
  }

  /**
   * Removes a pump FormGroup from the pumps FormArray at the specified index.
   * @param index - The index of the pump to remove.
   */
  removePump(index: number): void {
    this.pumps.removeAt(index);
    // Re-index pump numbers after removal
    this.pumps.controls.forEach((group, i) => {
        group.get('pumpNumber')?.setValue(i + 1);
    });
  }

  /**
   * Submits the form data.
   */
  onSubmit() {
    if (this.stationForm.valid) {
      const formData = this.stationForm.value;
      
      formData.pumps = formData.pumps?.map(pump => ({
          ...pump,
          pumpNumber: Number(pump.pumpNumber)
      }));

      this.dialogRef.close(formData);
    } else {
      this.stationForm.markAllAsTouched();
      this.snackBar.open('Please fix the validation errors before submitting.', 'Close', { duration: 3000 });
    }
  }

  /**
   * Resets the form (only resets and doesn't close the dialog).
   */
  onCancel() {
    this.stationForm.reset();
    this.dialogRef.close(false); // Close dialog without data
  }
}