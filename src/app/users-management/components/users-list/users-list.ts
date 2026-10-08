import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersStore } from '../../store/users.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { ThemeService } from '../../../theme.service';
import { User, fullName } from '../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersListComponent implements OnInit {
  protected readonly store = inject(UsersStore);
  protected readonly auth = inject(AuthStore);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly currentUser = this.auth.user;
  protected readonly userRole = this.auth.role;
  protected readonly userInitial = this.auth.userInitial;
  protected readonly canCreateUsers = this.auth.canManageUsers;

  protected get theme() {
    return this.themeService.theme;
  }

  protected toggleTheme() {
    this.themeService.toggleTheme();
  }

  protected onLogout() {
    this.auth.logout();
  }

  ngOnInit() {
    this.store.loadUsers();
  }

  protected onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.store.setSearchQuery(val);
  }

  protected openAddUser() {
    this.store.openAddUserModal();
  }

  protected viewUser(userId: string) {
    this.router.navigate([userId], { relativeTo: this.route });
  }

  protected getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'role-badge role-admin';
      case 'director': return 'role-badge role-director';
      case 'manager': return 'role-badge role-manager';
      default: return 'role-badge';
    }
  }

  protected getFullName(user: User): string {
    return fullName(user);
  }

  protected getInitial(user: User): string {
    return (user.firstName || user.username).charAt(0).toUpperCase();
  }

  protected trackByUserId(_: number, user: User): string {
    return user.id;
  }
}
