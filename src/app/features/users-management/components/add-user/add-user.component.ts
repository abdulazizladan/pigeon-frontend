import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
  standalone: false
})
export class AddUserComponent {

  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserComponent>
  ) {
    this.userForm = this.fb.group({
      credentials: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        role: ['manager', Validators.required],
      }),
      info: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        age: [null, [Validators.required, Validators.min(18)]],
        image: ['']
      }),
      contact: this.fb.group({
        phone: ['', Validators.required]
      })
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const userData = {
        email: formValue.credentials.email,
        password: formValue.credentials.password,
        role: formValue.credentials.role,
        info: formValue.info,
        contact: formValue.contact
      };
      this.dialogRef.close(userData);
    }
  }
}
