import { Component, computed, effect, inject, signal } from '@angular/core';
import { ManagersStore } from '../../store/managers.store';
import { PHONE_NUMBER_PATTERN } from '../../../users-management/models/user.model';

/** Creates a manager account. Admins and directors may open it; the backend enforces the same rule. */
@Component({
  selector: 'app-add-manager-modal',
  standalone: false,
  templateUrl: './add-manager-modal.html',
  styleUrl: './add-manager-modal.css',
})
export class AddManagerModalComponent {
  protected readonly store = inject(ManagersStore);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly phoneNumber = signal('');
  protected readonly username = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);

  protected readonly firstNameError = computed(() =>
    this.firstName().trim().length > 50 ? 'First name must be 50 characters or fewer.' : null,
  );
  protected readonly lastNameError = computed(() =>
    this.lastName().trim().length > 50 ? 'Last name must be 50 characters or fewer.' : null,
  );
  protected readonly phoneNumberError = computed(() => {
    const v = this.phoneNumber().trim();
    return v && !PHONE_NUMBER_PATTERN.test(v) ? 'Enter a valid phone number (e.g. +234 801 234 5678).' : null;
  });
  protected readonly usernameError = computed(() => {
    const v = this.username().trim();
    if (v && v.length < 3) return 'Username must be at least 3 characters.';
    if (v && !/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers and underscores are allowed.';
    if (v && this.store.managers().some((m) => m.username.toLowerCase() === v.toLowerCase())) return 'A manager with this username already exists.';
    return null;
  });
  protected readonly passwordError = computed(() =>
    this.password() && this.password().length < 6 ? 'Password must be at least 6 characters.' : null,
  );

  protected readonly isFormValid = computed(
    () =>
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

  protected readonly isSubmitting = computed(() => this.store.createLoadingState() === 'loading');

  constructor() {
    effect(() => {
      if (this.store.isAddManagerModalOpen() || this.store.createLoadingState() === 'success') {
        this.resetForm();
      }
    });
  }

  protected onClose() {
    this.store.closeAddManagerModal();
  }

  protected onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('um-modal-backdrop')) this.onClose();
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid() || this.isSubmitting()) return;
    const phone = this.phoneNumber().trim();
    this.store.createManager({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      ...(phone ? { phoneNumber: phone } : {}),
      username: this.username().trim(),
      password: this.password(),
    });
  }

  protected set(field: 'firstName' | 'lastName' | 'phoneNumber' | 'username' | 'password', event: Event) {
    this[field].set((event.target as HTMLInputElement).value);
  }

  protected togglePassword() {
    this.showPassword.update((v) => !v);
  }

  private resetForm() {
    this.firstName.set('');
    this.lastName.set('');
    this.phoneNumber.set('');
    this.username.set('');
    this.password.set('');
    this.showPassword.set(false);
  }
}
