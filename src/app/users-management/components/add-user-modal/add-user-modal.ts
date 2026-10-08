import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { UsersStore } from '../../store/users.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { UserRole, PHONE_NUMBER_PATTERN } from '../../models/user.model';

@Component({
  selector: 'app-add-user-modal',
  standalone: false,
  templateUrl: './add-user-modal.html',
  styleUrl: './add-user-modal.css',
})
export class AddUserModalComponent implements OnDestroy {
  protected readonly store = inject(UsersStore);
  private readonly auth = inject(AuthStore);

  protected readonly currentUserRole = this.auth.role;

  protected readonly firstName = signal<string>('');
  protected readonly lastName = signal<string>('');
  protected readonly phoneNumber = signal<string>('');
  protected readonly username = signal<string>('');
  protected readonly password = signal<string>('');
  protected readonly role = signal<UserRole>('manager');
  protected readonly showPassword = signal<boolean>(false);

  // Roles available based on who's logged in
  protected readonly availableRoles = computed<UserRole[]>(() => {
    if (this.currentUserRole() === 'director') return ['manager'];
    return ['admin', 'director', 'manager'];
  });

  // Validation helpers
  protected readonly firstNameError = computed(() => {
    const val = this.firstName().trim();
    if (val && val.length > 50) return 'First name must be 50 characters or fewer.';
    return null;
  });

  protected readonly lastNameError = computed(() => {
    const val = this.lastName().trim();
    if (val && val.length > 50) return 'Last name must be 50 characters or fewer.';
    return null;
  });

  protected readonly phoneNumberError = computed(() => {
    const val = this.phoneNumber().trim();
    if (val && !PHONE_NUMBER_PATTERN.test(val)) return 'Enter a valid phone number (e.g. +1 555 123 4567).';
    return null;
  });

  protected readonly usernameError = computed(() => {
    const val = this.username();
    if (val && val.length < 3) return 'Username must be at least 3 characters.';
    if (val && !/^[a-zA-Z0-9_]+$/.test(val)) return 'Only letters, numbers, and underscores allowed.';
    return null;
  });

  protected readonly passwordError = computed(() => {
    const val = this.password();
    if (val && val.length < 6) return 'Password must be at least 6 characters.';
    return null;
  });

  protected readonly isFormValid = computed(() =>
    this.firstName().trim().length > 0 &&
    this.lastName().trim().length > 0 &&
    this.username().trim().length >= 3 &&
    this.password().length >= 6 &&
    !this.firstNameError() &&
    !this.lastNameError() &&
    !this.phoneNumberError() &&
    !this.usernameError() &&
    !this.passwordError(),
  );

  protected readonly isSubmitting = computed(
    () => this.store.createLoadingState() === 'loading',
  );

  constructor() {
    // The store closes the modal on success; clear the form so the next open starts fresh.
    effect(() => {
      if (this.store.createLoadingState() === 'success') {
        this.resetForm();
      }
    });
  }

  ngOnDestroy() {
    this.resetForm();
  }

  protected onClose() {
    this.store.closeAddUserModal();
    this.resetForm();
  }

  protected onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) {
      this.onClose();
    }
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid() || this.isSubmitting()) return;
    const phone = this.phoneNumber().trim();
    this.store.createUser({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      ...(phone ? { phoneNumber: phone } : {}),
      username: this.username().trim(),
      password: this.password(),
      role: this.role(),
    });
  }

  protected togglePasswordVisibility() {
    this.showPassword.update((v) => !v);
  }

  protected updateFirstName(event: Event) {
    this.firstName.set((event.target as HTMLInputElement).value);
  }

  protected updateLastName(event: Event) {
    this.lastName.set((event.target as HTMLInputElement).value);
  }

  protected updatePhoneNumber(event: Event) {
    this.phoneNumber.set((event.target as HTMLInputElement).value);
  }

  protected updateUsername(event: Event) {
    this.username.set((event.target as HTMLInputElement).value);
  }

  protected updatePassword(event: Event) {
    this.password.set((event.target as HTMLInputElement).value);
  }

  protected updateRole(event: Event) {
    this.role.set((event.target as HTMLSelectElement).value as UserRole);
  }

  protected getRoleDescription(role: UserRole): string {
    switch (role) {
      case 'admin': return 'Full system access including user management';
      case 'director': return 'Can manage teams and create managers';
      case 'manager': return 'Standard operational access';
    }
  }

  private resetForm() {
    this.firstName.set('');
    this.lastName.set('');
    this.phoneNumber.set('');
    this.username.set('');
    this.password.set('');
    this.showPassword.set(false);
    const roles = this.availableRoles();
    this.role.set(roles[roles.length - 1]);
  }
}
