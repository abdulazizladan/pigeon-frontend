import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { ThemeService } from '../../../../theme.service';

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly auth = inject(AuthStore);
  protected readonly themeService = inject(ThemeService);

  // Expose current session details
  protected readonly currentUser = this.auth.user;
  protected readonly userInitial = this.auth.userInitial;

  protected readonly isSidebarOpen = signal(true);

  protected get theme() {
    return this.themeService.theme;
  }

  protected toggleTheme() {
    this.themeService.toggleTheme();
  }

  protected toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  protected onLogout() {
    this.auth.logout();
  }
}
