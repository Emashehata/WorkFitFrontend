// features/auth/register-organization/register-organization.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-register-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-organization.component.html',
  styleUrls: ['./register-organization.component.css'],
})
export class RegisterOrganizationComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = signal(false);
  serverError = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  form = this.fb.nonNullable.group(
    {
      organizationName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  get f() {
    return this.form.controls;
  }

  // Password strength calculation
  getPasswordStrength(): number {
    const password = this.form.get('password')?.value || '';

    if (password.length === 0) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 15;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 15;

    // Contains numbers
    if (/\d/.test(password)) strength += 15;

    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;

    // Cap at 100
    return Math.min(strength, 100);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();

    if (strength === 0) return 'No password';
    if (strength < 30) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 70) return 'Good';
    if (strength < 90) return 'Strong';
    return 'Very Strong';
  }

  // Password validation helpers
  hasMinLength(): boolean {
    const password = this.form.get('password')?.value || '';
    return password.length >= 8;
  }

  hasUppercase(): boolean {
    const password = this.form.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.form.get('password')?.value || '';
    return /\d/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.form.get('password')?.value || '';
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      // Scroll to first invalid field
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.serverError.set(null);
    this.isSubmitting.set(true);

    this.authService.registerOrganization(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login'], {
          queryParams: {
            registered: '1',
            email: this.form.getRawValue().email,
          },
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);

        let errorMessage = 'Something went wrong. Please try again.';
        if (err.error?.userFriendlyMessage) {
          errorMessage = err.error.userFriendlyMessage;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        this.serverError.set(errorMessage);

        // Auto dismiss error after 8 seconds
        setTimeout(() => {
          this.serverError.set(null);
        }, 8000);
      },
    });
  }
}
