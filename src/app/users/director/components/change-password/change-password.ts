import { Component, inject, signal } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  AbstractControl, 
  ValidationErrors, 
} from '@angular/forms';
import { DirectorService } from '../../services/director.service';
import { MatDialogRef } from '@angular/material/dialog';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  // Return null if one or both fields are empty (let the required validator handle it)
  if (!password || !confirmPassword) {
    return null;
  }

  // If they don't match, return the custom error object
  return password === confirmPassword ? null : { emailsMismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {
  private fb = inject(FormBuilder);
  private directorService = inject(DirectorService);
  isSubmitting = signal<boolean>(false);

  constructor(
    private dialogRef: MatDialogRef<ChangePassword>
  ){

  }

  // Define the FormGroup with initial values, synchronous validators, 
  // and the custom cross-field validator in the options object.
  changeForm: FormGroup = this.fb.group({
    password: ['', [Validators.required]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatchValidator }); // Apply custom validator here

  // Convenience getters to easily access controls in the template and code
  get passwordControl() {
    return this.changeForm.get('password')!;
  }

  get confirmPasswordControl() {
    return this.changeForm.get('confirmPassword')!;
  }

  async onSubmit() { // 👈 Make the function 'async'
    // 1. Trigger validation messages
    this.changeForm.markAllAsTouched();

    if (this.changeForm.invalid) {
      return; 
    }

    this.isSubmitting.set(true);

    // Destructure values from the Form Group
    const newPassword: string = this.changeForm.get('password')?.value;

    try {
      // 2. Await the promise from the service call
      const response = await this.directorService.changePassword(newPassword); 
      //console.log(response)
      this.dialogRef.close(response)
      // In a real app, you would navigate or show a success message here
      // For example, display a success toast or redirect:
      // this.router.navigate(['/profile']);

    } catch (error) {
      console.error('Change password failed:', error);
      // Handle API error, e.g., show an error message to the user
      // this.errorMessage.set('Failed to change password. Please try again.');
    } finally {
      // 3. Ensure the submitting state is reset regardless of success or failure
      this.isSubmitting.set(false);
    }
  }
}
