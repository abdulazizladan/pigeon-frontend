import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-dispenser',
  standalone: false,
  templateUrl: './add-dispenser.component.html',
  styleUrl: './add-dispenser.component.scss'
})
export class AddDispenserComponent implements OnInit{

  private fb = inject(FormBuilder);
  dispenserForm: FormGroup = new FormGroup({});
  private dialogRef = inject(MatDialogRef<AddDispenserComponent>)

  ngOnInit(): void {
    this.dispenserForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      phone: ['', Validators.required]
    })
  }

  onSubmit() {
    this.dialogRef.close(this.dispenserForm.value)
  }

}
