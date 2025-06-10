import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-station',
  standalone: false,
  templateUrl: './add-station.component.html',
  styleUrl: './add-station.component.scss'
})
export class AddStationComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddStationComponent>)

  stationForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    ward: ['', Validators.required],
    lga: ['', Validators.required],
    state: ['', Validators.required],
    longitude: [0, Validators.required],
    latitude: [0, Validators.required],
    pricePerLiter: [0, [Validators.required, Validators.min(0)]]
  });

  onSubmit() {
    if (this.stationForm.valid) {
      const formData = this.stationForm.value;
      this.dialogRef.close(formData)
    }
  }

  onCancel() {
    this.stationForm.reset();
    // Add any additional cancel logic here
  }
}
