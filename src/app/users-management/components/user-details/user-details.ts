import { Component, inject, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersStore } from '../../store/users.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { ThemeService } from '../../../theme.service';
import { User, fullName } from '../../models/user.model';

@Component({
  selector: 'app-user-details',
  standalone: false,
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(UsersStore);
  private readonly auth = inject(AuthStore);
  private readonly themeService = inject(ThemeService);

  protected readonly userId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  protected readonly user = computed(() =>
    this.store.users().find((u) => u.id === this.userId()) ?? null,
  );

  protected readonly isLoading = computed(() => this.store.loadingState() === 'loading');
  protected readonly loadError = computed(() => this.store.loadingState() === 'error' ? this.store.errorMessage() : null);

  protected readonly currentUser = this.auth.user;

  protected get theme() {
    return this.themeService.theme;
  }

  ngOnInit() {
    // If users haven't been loaded yet, load them
    if (this.store.loadingState() === 'idle') {
      this.store.loadUsers();
    }
  }

  protected goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'director': return 'Director';
      case 'manager': return 'Manager';
      default: return role;
    }
  }

  protected getRoleDescription(role: string): string {
    switch (role) {
      case 'admin': return 'Full system access with user management and configuration privileges.';
      case 'director': return 'Team leadership access — can manage staff and create managers.';
      case 'manager': return 'Operational access for managing daily workflows and tasks.';
      default: return '';
    }
  }

  protected getFullName(user: User): string {
    return fullName(user);
  }

  protected getInitials(user: User): string {
    return (user.firstName || user.username).charAt(0).toUpperCase();
  }
}
