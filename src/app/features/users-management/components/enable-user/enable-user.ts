import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-enable-user',
  standalone: false,
  templateUrl: './enable-user.html',
  styleUrl: './enable-user.scss'
})
export class EnableUser {
  readonly data = inject<{email: string}>(MAT_DIALOG_DATA);

  private dialogRef =  inject(MatDialogRef<EnableUser>)

  onSubmit() {
    this.dialogRef.close(this.data.email)
  }
}
