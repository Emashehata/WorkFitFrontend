// features/organization/organization-settings/organization-settings.component.ts
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization/organization.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Organization } from '../../../core/models/organization.models';

// Prevents saving malformed JSON that would silently break rendering elsewhere
// once brandingJson/settingsJson are read back and parsed.
function validJson(control: AbstractControl): ValidationErrors | null {
  const value = control.value?.trim();
  if (!value) return null; // empty is fine, defaults to "{}" on save
  try {
    JSON.parse(value);
    return null;
  } catch {
    return { invalidJson: true };
  }
}

@Component({
  selector: 'app-organization-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './organization-settings.component.html',
})
export class OrganizationSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private organizationService = inject(OrganizationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  organization = signal<Organization | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  loadError = signal<string | null>(null); // separate from save errors — needs its own retry path
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  activeTab = signal<'details' | 'settings' | 'employees'>('details');

  organizationForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    brandingJson: ['', validJson],
    settingsJson: ['', validJson],
  });

  settingsForm: FormGroup = this.fb.group({
    timezone: ['UTC'],
    dateFormat: ['MM/DD/YYYY'],
    language: ['en'],
  });

  // Surfaces "you have unsaved changes" without a separate boolean to keep in sync manually
  formIsDirty = computed(() => this.organizationForm.dirty);

  ngOnInit(): void {
    this.loadOrganizationData();
  }

  loadOrganizationData(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.organizationService.getOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        this.organizationForm.reset(
          {
            name: org.name,
            brandingJson: org.brandingJson || '',
            settingsJson: org.settingsJson || '',
          },
          { emitEvent: false }, // avoids marking the form dirty immediately after loading real data
        );
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('Failed to load organization details.');
      },
    });

    this.organizationService.getOrganizationSettings().subscribe({
      next: (settings) => {
        try {
          const parsed = JSON.parse(settings.settingsJson || '{}');
          this.settingsForm.patchValue(parsed, { emitEvent: false });
        } catch {
          // Malformed data already saved server-side — fall back to defaults silently,
          // don't block the details tab from working over a settings-tab data issue.
        }
      },
      error: () => {
        // Non-fatal: details tab still works even if settings fails to load.
        // Deliberately no error banner here — one failed call shouldn't block the other tab.
      },
    });
  }

  onSaveOrganization(): void {
    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { name, brandingJson, settingsJson } =
      this.organizationForm.getRawValue();
    const updateData = {
      name,
      brandingJson: brandingJson?.trim() || '{}',
      settingsJson: settingsJson?.trim() || '{}',
    };

    this.organizationService.updateOrganization(updateData).subscribe({
      next: (updatedOrg) => {
        this.organization.set(updatedOrg);
        this.organizationForm.markAsPristine(); // clears the "unsaved changes" state now that it's saved
        this.isSaving.set(false);
        this.successMessage.set('Organization details updated.');
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          err.error?.userFriendlyMessage ??
            'Failed to update organization. Please try again.',
        );
      },
    });
  }

  onSaveSettings(): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const settingsJson = JSON.stringify(this.settingsForm.value);

    this.organizationService
      .updateOrganizationSettings({ settingsJson })
      .subscribe({
        next: () => {
          this.settingsForm.markAsPristine();
          this.isSaving.set(false);
          this.successMessage.set('Preferences updated.');
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(
            err.error?.userFriendlyMessage ??
              'Failed to update settings. Please try again.',
          );
        },
      });
  }

  switchTab(tab: 'details' | 'settings' | 'employees'): void {
    // Warn before losing unsaved edits when leaving the Details tab, rather than silently discarding them.
    if (
      this.activeTab() === 'details' &&
      tab !== 'details' &&
      this.organizationForm.dirty
    ) {
      const proceed = confirm('You have unsaved changes. Switch tabs anyway?');
      if (!proceed) return;
    }
    this.activeTab.set(tab);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'O';
  }

  logout(): void {
    this.authService.logout(); 
  }
}
