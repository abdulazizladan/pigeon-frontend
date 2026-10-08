import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { AuthStore } from '../auth/store/auth.store';
import { UserRole } from '../auth/models/auth.model';
import { UsersStore } from '../users-management/store/users.store';
import { PHONE_NUMBER_PATTERN } from '../users-management/models/user.model';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthStore);
  protected readonly usersStore = inject(UsersStore);
  private readonly themeService = inject(ThemeService);

  // Session
  protected readonly currentUser = this.auth.user;
  protected readonly userRole = computed(() => this.auth.role() ?? '');
  protected readonly userInitial = this.auth.userInitial;
  protected readonly canCreateUsers = this.auth.canManageUsers;

  // User stats (derived from the shared UsersStore)
  protected readonly totalUsers = this.usersStore.totalCount;
  protected readonly adminUsers = computed(() => this.usersStore.roleCounts().admin);
  protected readonly directorUsers = computed(() => this.usersStore.roleCounts().director);
  protected readonly managerUsers = computed(() => this.usersStore.roleCounts().manager);

  // Roles the current user may assign
  protected readonly availableRoles = computed<UserRole[]>(() =>
    this.auth.role() === 'director' ? ['manager'] : ['admin', 'director', 'manager'],
  );

  // Create-user widget form state
  protected readonly newFirstName = signal<string>('');
  protected readonly newLastName = signal<string>('');
  protected readonly newPhoneNumber = signal<string>('');
  protected readonly newUsername = signal<string>('');
  protected readonly newPassword = signal<string>('');
  protected readonly newRole = signal<UserRole>('manager');
  private readonly validationError = signal<string>('');
  private readonly lastCreatedUsername = signal<string>('');

  protected readonly isCreating = computed(() => this.usersStore.createLoadingState() === 'loading');
  protected readonly isCreateSuccess = computed(
    () => !this.validationError() && this.usersStore.createLoadingState() === 'success',
  );
  protected readonly createMessage = computed(() => {
    if (this.validationError()) return this.validationError();
    switch (this.usersStore.createLoadingState()) {
      case 'success':
        return `User "${this.lastCreatedUsername()}" created successfully!`;
      case 'error':
        return this.usersStore.createErrorMessage() ?? 'An error occurred during user creation.';
      default:
        return '';
    }
  });

  constructor() {
    this.usersStore.resetCreateState();
    this.newRole.set(this.availableRoles()[0]);

    effect(() => {
      if (this.usersStore.createLoadingState() === 'success') {
        this.newFirstName.set('');
        this.newLastName.set('');
        this.newPhoneNumber.set('');
        this.newUsername.set('');
        this.newPassword.set('');
        this.newRole.set(this.availableRoles()[0]);
      }
    });
  }

  protected get theme() {
    return this.themeService.theme;
  }

  protected toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngOnInit() {
    // Managers get 403 on GET /users, so only load when the role allows it.
    if (this.canCreateUsers()) {
      this.usersStore.loadUsers();
    }
  }

  protected onCreateUser(event: Event) {
    event.preventDefault();
    const username = this.newUsername().trim();
    const firstName = this.newFirstName().trim();
    const lastName = this.newLastName().trim();
    const phoneNumber = this.newPhoneNumber().trim();
    if (!firstName || !lastName || !username || !this.newPassword() || !this.newRole()) {
      this.usersStore.resetCreateState();
      this.validationError.set('Please fill out all required fields.');
      return;
    }
    if (phoneNumber && !PHONE_NUMBER_PATTERN.test(phoneNumber)) {
      this.usersStore.resetCreateState();
      this.validationError.set('Enter a valid phone number (e.g. +1 555 123 4567).');
      return;
    }
    this.validationError.set('');
    this.lastCreatedUsername.set(username);
    this.usersStore.createUser({
      firstName,
      lastName,
      ...(phoneNumber ? { phoneNumber } : {}),
      username,
      password: this.newPassword(),
      role: this.newRole(),
    });
  }

  protected onLogout() {
    this.auth.logout();
  }

  protected updateCreateField(
    field: 'firstName' | 'lastName' | 'phoneNumber' | 'username' | 'password' | 'role',
    event: Event,
  ) {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    switch (field) {
      case 'firstName': this.newFirstName.set(value); break;
      case 'lastName': this.newLastName.set(value); break;
      case 'phoneNumber': this.newPhoneNumber.set(value); break;
      case 'username': this.newUsername.set(value); break;
      case 'password': this.newPassword.set(value); break;
      case 'role': this.newRole.set(value as UserRole); break;
    }
    if (this.validationError()) this.validationError.set('');
  }
}
