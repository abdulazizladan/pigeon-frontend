import { Component, OnInit, inject, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthStore } from '../../../../auth/store/auth.store';

export interface DialogData {
  title?: string;
  description?: string;
  status?: 'active' | 'resolved' | 'terminated' | 'canceled';
}

@Component({
  selector: 'app-add-ticket',
  standalone: false,
  templateUrl: './add-ticket.component.html',
  styleUrl: './add-ticket.component.scss'
})
export class AddTicketComponent implements OnInit {

  dialogForm: FormGroup = new FormGroup({});
  private authStore = inject(AuthStore);

  constructor(
    public dialogRef: MatDialogRef<AddTicketComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: DialogData | null,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const data = this.data || {};
    this.dialogForm = this.fb.group({
      title: [data.title || '', Validators.required],
      description: [data.description || ''],
      status: [data.status || 'active']
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.dialogForm.valid) {
      const ticketData = {
        title: this.dialogForm.value.title,
        description: this.dialogForm.value.description,
        email: this.authStore.userEmail()
      };
      this.dialogRef.close(ticketData);
    }
  }

}
