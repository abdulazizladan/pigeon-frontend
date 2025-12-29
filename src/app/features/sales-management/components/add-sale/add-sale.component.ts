import { Component, inject, OnInit, Inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DispenserService } from '../../../dispensers-management/services/dispenser.service';
import { Dispenser } from '../../../dispensers-management/models/dispenser.model';

export interface DialogData {
  dispenserId: number,
  pumpId: number,
  startingBalance: number,
  closingBalance: number
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
  private dispenserService = inject(DispenserService);

  public dispensers = signal<Dispenser[]>([]);
  protected saleForm: FormGroup = new FormGroup({})

  async ngOnInit() {
    this.saleForm = this.fb.group({
      dispenserId: ['', [Validators.required]],
      pumpId: [0, [Validators.required]],
      startingBalance: [0, [Validators.required]],
      closingBalance: [0, [Validators.required]]
    });

    try {
      const dispensers = await this.dispenserService.get();
      this.dispensers.set(dispensers);
    } catch (error) {
      console.error('Failed to load dispensers', error);
    }
  }

  onSubmit(): void {
    if (this.saleForm.valid) {
      this.dialogRef.close(this.saleForm.value)
    }
  }

}
