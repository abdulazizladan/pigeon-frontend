import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { DirectorStore } from '../../store/director.store';
import { MatDialog } from '@angular/material/dialog';
import { ChangePassword } from '../change-password/change-password';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  public authStore = inject(AuthStore);
  public directorStore = inject(DirectorStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private email: string | null = '';

  ngOnInit(): void {
    this.email = this.authStore.userEmail();
    this.directorStore.loadProfile(this.email as string);
  }

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open (ChangePassword, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        const snackBarRef = this.snackBar.open(
          'Password changed successfully!',
          'Close',
          {
            duration: 5000
          }
        );
      }
    })
  }

}
