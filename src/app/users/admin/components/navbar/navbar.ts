import { Component, inject } from '@angular/core';
import { AuthStore } from '../../../../auth/store/auth.store';
import { ThemeService } from '../../../../theme.service';
import { AdminLayoutStore } from '../../store/admin-layout.store';

/**
 * Fixed top bar for the admin shell. Drawer toggle and app name sit on the
 * far left; profile, theme toggle and logout on the right.
 */
@Component({
  selector: 'app-admin-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class AdminNavbarComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly layout = inject(AdminLayoutStore);
  private readonly themeService = inject(ThemeService);

  protected readonly currentUser = this.auth.user;
  protected readonly userInitial = this.auth.userInitial;
  protected readonly isSidebarOpen = this.layout.isSidebarOpen;

  protected get theme() {
    return this.themeService.theme;
  }

  protected toggleTheme() {
    this.themeService.toggleTheme();
  }

  protected toggleSidebar() {
    this.layout.toggleSidebar();
  }

  protected onLogout() {
    this.auth.logout();
  }
}
