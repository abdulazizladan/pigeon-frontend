import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.dispenserForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      phone: ['', Validators.required]
    })
  }

  onSubmit() {
    const formData = this.dispenserForm.value;
    this.dialogRef.close(formData)

    const snackBarRef = this.snackBar.open('Dispenser successfully added!', 'Open Details', {
      duration: 5000
    });

    snackBarRef.onAction().subscribe(() => {
      const id = (formData as any)?.id;
      if (id) {
        this.router.navigate(['/dispensers', id]);
      } else {
        this.router.navigate(['/dispensers']);
      }
    });
  }

}
