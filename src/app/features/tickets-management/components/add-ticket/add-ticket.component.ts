import { Component,  OnInit, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  description: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-add-ticket',
  standalone: false,
  templateUrl: './add-ticket.component.html',
  styleUrl: './add-ticket.component.scss'
})
export class AddTicketComponent implements OnInit{

  dialogForm: FormGroup = new FormGroup({});

  constructor(
    public dialogRef: MatDialogRef<AddTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.dialogForm = this.fb.group({
      title: [this.data.title || '', Validators.required],
      description: [this.data.description || ''],
      status: [this.data.status || 'active']
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.dialogForm.valid) {
      this.dialogRef.close(this.dialogForm.value);
    }
  }

}
