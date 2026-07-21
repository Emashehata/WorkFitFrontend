import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../../core/services/organization/organization.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { Organization } from '../../../core/models/organization.models';

type SettingsTabId = 'general' | 'preferences' | 'employees' | 'billing' | 'security';

interface SettingsTab {
  id: SettingsTabId;
  label: string;
  description: string;
  icon: string;
  badge?: string;
}

function safeParse<T>(json: string | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return { ...fallback, ...JSON.parse(json) };
  } catch {
    return fallback;
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
  private toastService = inject(ToastService);

  organization = signal<Organization | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  activeTab = signal<SettingsTabId>('general');

  readonly settingsTabs: SettingsTab[] = [
    { 
      id: 'general', 
      label: 'General', 
      description: 'Core organization info', 
      icon: 'fa-solid fa-building' 
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      description: 'Regional & language', 
      icon: 'fa-solid fa-sliders-h' 
    },
    { 
      id: 'employees', 
      label: 'Employees', 
      description: 'Team management', 
      icon: 'fa-solid fa-users',
      badge: 'Soon'
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      description: 'Subscription & payments', 
      icon: 'fa-solid fa-credit-card' 
    },
    { 
      id: 'security', 
      label: 'Security', 
      description: 'Access & compliance', 
      icon: 'fa-solid fa-shield-halved' 
    },
  ];

  generalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    website: [''],
    industry: [''],
    size: [''],
    foundedYear: [''],
  });

  preferencesForm: FormGroup = this.fb.group({
    timezone: ['UTC'],
    language: ['en'],
    dateFormat: ['MM/DD/YYYY'],
    weekStart: ['Sunday'],
    timeFormat: ['12h'],
  });

  private latestSettingsData: any = {};

  ngOnInit(): void {
    this.loadOrganizationData();
  }

  loadOrganizationData(): void {
    this.isLoading.set(true);

    this.organizationService.getOrganization().subscribe({
      next: (org) => {
        this.organization.set(org);
        
        const settings = safeParse(org.settingsJson, {
          website: '',
          industry: '',
          size: '',
          foundedYear: '',
          timezone: 'UTC',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
          weekStart: 'Sunday',
          timeFormat: '12h',
        });
        this.latestSettingsData = settings;

        this.generalForm.reset({
          name: org.name,
          website: settings.website,
          industry: settings.industry,
          size: settings.size,
          foundedYear: settings.foundedYear,
        }, { emitEvent: false });

        this.preferencesForm.reset({
          timezone: settings.timezone,
          language: settings.language,
          dateFormat: settings.dateFormat,
          weekStart: settings.weekStart,
          timeFormat: settings.timeFormat,
        }, { emitEvent: false });

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.error('Load Failed', 'Failed to load organization details.');
      },
    });
  }

  private mergedSettingsJson(patch: any): string {
    this.latestSettingsData = { ...this.latestSettingsData, ...patch };
    return JSON.stringify(this.latestSettingsData);
  }

  saveGeneral(): void {
    if (this.generalForm.invalid) {
      this.generalForm.markAllAsTouched();
      this.toastService.warning('Invalid Form', 'Please fix all validation errors.');
      return;
    }

    this.isSaving.set(true);
    const { name, website, industry, size, foundedYear } = this.generalForm.getRawValue();

    this.organizationService.updateOrganization({
      name,
      settingsJson: this.mergedSettingsJson({ website, industry, size, foundedYear }),
    }).subscribe({
      next: (updatedOrg) => {
        this.organization.set(updatedOrg);
        this.generalForm.markAsPristine();
        this.isSaving.set(false);
        this.toastService.success('Saved!', 'Organization details updated successfully.');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error('Update Failed', err.error?.userFriendlyMessage ?? 'Failed to update organization.');
      },
    });
  }

  savePreferences(): void {
    this.isSaving.set(true);
    const { timezone, language, dateFormat, weekStart, timeFormat } = this.preferencesForm.getRawValue();
    const settingsJson = this.mergedSettingsJson({ timezone, language, dateFormat, weekStart, timeFormat });

    this.organizationService.updateOrganizationSettings({ settingsJson }).subscribe({
      next: () => {
        this.preferencesForm.markAsPristine();
        this.isSaving.set(false);
        this.toastService.success('Settings Saved', 'Preferences updated successfully.');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error('Settings Failed', err.error?.userFriendlyMessage ?? 'Failed to update settings.');
      },
    });
  }

  switchTab(tabId: SettingsTabId): void {
    const dirtyForms: Partial<Record<SettingsTabId, boolean>> = {
      general: this.generalForm.dirty,
      preferences: this.preferencesForm.dirty,
    };
    if (dirtyForms[this.activeTab()] && tabId !== this.activeTab()) {
      const proceed = confirm('You have unsaved changes. Switch tabs anyway?');
      if (!proceed) return;
    }
    this.activeTab.set(tabId);
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'O';
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('Logged Out', 'You have been logged out successfully.');
  }
}