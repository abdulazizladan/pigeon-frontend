import { Component, inject, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
export class AddSaleComponent implements OnInit{

  constructor(
    public dialogRef: MatDialogRef<AddSaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ){}

  private fb = inject(FormBuilder);
  private saleForm: FormGroup = new FormGroup({})

  ngOnInit() {
    this.saleForm = this.fb.group({
      dispenserId: [0, [Validators.required]],
      pumpId: [0, [Validators.required]],
      startingBalance: [0, [Validators.required]],
      closingBalance: [0, [Validators.required]]
    })
  }

  onSubmit(): void {
    if(this.saleForm.valid) {
      this.dialogRef.close(this.saleForm.value)
    }
  }

}
