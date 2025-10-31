import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserStore } from '../../store/user.store';
import { MatDialog } from '@angular/material/dialog';
import { SuspendUserComponent } from '../suspend-user/suspend-user.component';

@Component({
  selector: 'app-user-details',
  standalone: false,
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}
  public userStore = inject(UserStore);
  public email: string = '';
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.email = this.route.snapshot.paramMap.get('email')!;
    this.userStore.selectUser(this.email)
  }

  openSuspendUserDialog(email: string | undefined) {
    const dialogRef = this.dialog.open(SuspendUserComponent, {
      width: '400px',
      data: { email: this.email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.userStore.suspendUser(this.email);
      }
    });
  }

  openEnableUserDialog(email: string | undefined) {
    const dialogRef = this.dialog.open(SuspendUserComponent, {
      width: '400px',
      data: { email: this.email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //this.userStore.suspendUser(this.email);
      }
    });
  }
}
