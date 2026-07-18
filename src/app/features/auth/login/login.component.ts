// features/auth/login/login.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  serverError = signal<string | null>(null);
  justRegistered = signal(false);
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // Check if user just registered
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === '1') {
        this.justRegistered.set(true);
        // Pre-fill email if provided
        if (params['email']) {
          this.form.patchValue({ email: params['email'] });
        }
        // Auto-hide the message after 8 seconds
        setTimeout(() => {
          this.justRegistered.set(false);
        }, 8000);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
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

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isSubmitting.set(false);

        let errorMessage = 'Invalid email or password. Please try again.';
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
