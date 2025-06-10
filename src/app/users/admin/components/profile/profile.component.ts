import { Component, inject, OnInit, Signal } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { AdminStore } from '../../store/admin.store';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{

  private authStore = inject(AuthStore);
  public adminStore = inject(AdminStore)
  email: any;

  ngOnInit(): void {
    this.email = this.authStore.userEmail();
    this.adminStore.loadProfile(this.email)
  }

}
