import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-dispenser',
  templateUrl: './add-dispenser.component.html',
  styleUrl: './add-dispenser.component.scss',
  standalone: false,
})
export class AddDispenserComponent {

  dispenserForm: FormGroup = new FormGroup({});

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddDispenserComponent>
  ) {
    this.dispenserForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }


  onSubmit() {
    if(this.dispenserForm.valid){
      const formValue = this.dispenserForm.value;
      const dispenserData = {
        firstName: formValue.firstName,
        middleName: formValue.middleName,
        lastName: formValue.lastName,
        dateAdded: Date.now(),
        phone: formValue.phone
      };
      this.dialogRef.close(dispenserData)
    }
  }
}
