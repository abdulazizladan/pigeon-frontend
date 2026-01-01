import { Component, inject, OnInit, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SalesStore } from '../../store/sales.store'; // Import store

export interface DialogData {
  // Define if any data is passed, empty for now based on request
}

@Component({
  selector: 'app-add-sale',
  standalone: false,
  templateUrl: './add-sale.component.html',
  styleUrl: './add-sale.component.scss'
})
export class AddSaleComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddSaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  private fb = inject(FormBuilder);
  // private pumpService = inject(PumpService); // Ideally invoke this

  // Mock pumps for now as service is missing/not found
  public pumps = signal<{ id: string, name: string }[]>([
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'Pump 1' },
    { id: 'b2c3d4e5-f6a7-8901-2345-678901bcdefg', name: 'Pump 2' }
  ]);

  private salesStore = inject(SalesStore);

  protected saleForm: FormGroup = new FormGroup({})

  ngOnInit() {
    this.saleForm = this.fb.group({
      product: ['PETROL', [Validators.required]],
      pricePerLitre: [680.75, [Validators.required, Validators.min(0)]],
      openingMeterReading: [1000, [Validators.required, Validators.min(0)]],
      closingMeterReading: [1200, [Validators.required, Validators.min(0)]],
      pumpId: ['', [Validators.required]]
    });

    // Load pumps here if service existed
  }

  onSubmit(): void {
    if (this.saleForm.valid) {
      const saleData = this.saleForm.value;
      this.salesStore.addSale(saleData);
      this.dialogRef.close(true); // Close with true to indicate success
    }
  }

}
