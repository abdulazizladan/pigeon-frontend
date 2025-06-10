import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-suspend-user',
  standalone: false,
  templateUrl: './suspend-user.component.html',
  styleUrl: './suspend-user.component.scss'
})
export class SuspendUserComponent {
  readonly data = inject<string>(MAT_DIALOG_DATA);

}
