import { Component, inject } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  public authStore = inject(AuthStore);

  logout() {
    this.authStore.logout();
  }
}
