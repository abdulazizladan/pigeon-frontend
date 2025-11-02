import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-manager',
  standalone: false,
  templateUrl: './add-manager.component.html',
  styleUrl: './add-manager.component.scss'
})
export class AddManagerComponent {


  managerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddManagerComponent>
  ) {
    this.managerForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      role: ["manager", [Validators.required]],
      info: this.fb.group({
        firstName: ["", [Validators.required]],
        lastName: ["", [Validators.required]],
        age: [null, [Validators.required, Validators.min(18)]],
        image: ["user.png"]
      }),
      contact: this.fb.group({
        phone: ["", [Validators.required]]
      })
    })
  }

 

  submit() {
    if(this.managerForm.valid) {
      const formValue = this.managerForm.value;
      const managerData = {
        email: formValue.email,
        password: formValue.password,
        role: "manager",
        info: formValue.info,
        contact: formValue.contact
      };
      this.dialogRef.close(managerData)
    }
  }

}
