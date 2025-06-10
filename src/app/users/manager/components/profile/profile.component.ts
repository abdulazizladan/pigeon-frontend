import { Component, inject, OnInit } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { ManagerStore } from '../../store/manager.store';
import { AdminStore } from '../../../admin/store/admin.store';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  public authStore = inject(AuthStore);
  public adminStore = inject(AdminStore)
  public managerStore = inject(ManagerStore);
  email: any;

  ngOnInit(): void {
    this.email = this.authStore.userEmail();
    this.managerStore.loadSummary()
  }

}
