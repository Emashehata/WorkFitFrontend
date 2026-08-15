import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InvitationTokenInfo } from '../../../core/models/invitation.models';
import { InvitationService } from '../../../core/services/invitation/invitation.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './accept-invitation.component.html',
  styleUrl: './accept-invitation.component.scss',
})
export class AcceptInvitationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private invitationService = inject(InvitationService);
  private fb = inject(FormBuilder);

  token = '';
  tokenInfo = signal<InvitationTokenInfo | null>(null);
  loading = signal(true);
  invalidToken = signal(false);
  submitting = signal(false);
  accepted = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/),
    ]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.loading.set(false);
      this.invalidToken.set(true);
      return;
    }

    this.invitationService.getTokenInfo(this.token).subscribe({
      next: (info) => {
        this.tokenInfo.set(info);
        this.form.controls.displayName.setValue(info.displayName);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.invalidToken.set(true);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    const value = this.form.getRawValue();
    this.invitationService.acceptInvitation({
      token: this.token,
      displayName: value.displayName.trim(),
      password: value.password,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.accepted.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || err?.error?.title || err?.error?.userFriendlyMessage || 'Your invitation could not be accepted. Please try again.');
      },
    });
  }

  hasMinLength(): boolean { return this.form.controls.password.value.length >= 8; }
  hasUppercase(): boolean { return /[A-Z]/.test(this.form.controls.password.value); }
  hasLowercase(): boolean { return /[a-z]/.test(this.form.controls.password.value); }
  hasNumber(): boolean { return /\d/.test(this.form.controls.password.value); }
  hasSpecial(): boolean { return /[^A-Za-z0-9]/.test(this.form.controls.password.value); }
}
