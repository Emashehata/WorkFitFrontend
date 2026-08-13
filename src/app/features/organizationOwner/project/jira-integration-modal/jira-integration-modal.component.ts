import { Component, inject, input, output, signal, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { IntegrationService } from '../../../../core/services/integration/integration.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { SyncResult } from '../../../../core/models/integration.models';

@Component({
  selector: 'app-jira-integration-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './jira-integration-modal.component.html',
  styleUrl: './jira-integration-modal.component.scss'
})
export class JiraIntegrationModalComponent implements OnInit {
  isOpen = input<boolean>(false);
  close = output<void>();
  synced = output<void>();

  private fb = inject(FormBuilder);
  private integrationService = inject(IntegrationService);
  private organizationService = inject(OrganizationService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isLoadingSettings = signal(false);
  isSubmitting = signal(false);
  syncResult = signal<SyncResult | null>(null);

  form = this.fb.nonNullable.group({
    baseUrl: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    apiToken: ['', [Validators.required]],
    projectKey: ['', [Validators.required]],
    pageSize: [100, [Validators.required, Validators.min(1), Validators.max(500)]],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadSettings();
      }
    });
  }

  ngOnInit() {
    if (this.isOpen()) {
      this.loadSettings();
    }
  }

  private loadSettings() {
    const orgId = this.getOrgId();
    if (!orgId) return;

    this.isLoadingSettings.set(true);
    this.integrationService.getJiraSettings(orgId).subscribe({
      next: (res) => {
        this.isLoadingSettings.set(false);
        if (res) {
          this.form.patchValue({
            baseUrl: res.baseUrl || '',
            email: res.email || '',
            projectKey: res.projectKey || '',
            pageSize: res.pageSize || 100,
          });
        }
      },
      error: (err) => {
        // Not configured yet or 404 is normal for first time
        this.isLoadingSettings.set(false);
      }
    });
  }

  private getOrgId(): string {
    const currentUser = this.authService.currentUser();
    const org = this.organizationService.organization();
    return currentUser?.orgId || org?.id || '';
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) return;

    const orgId = this.getOrgId();
    if (!orgId) {
      this.toast.error('Error', 'Organization ID not found. Please log in again.');
      return;
    }

    this.isSubmitting.set(true);
    this.syncResult.set(null);

    const req = {
      baseUrl: this.form.value.baseUrl!.trim(),
      email: this.form.value.email!.trim(),
      apiToken: this.form.value.apiToken!.trim(),
      projectKey: this.form.value.projectKey!.trim().toUpperCase(),
      pageSize: this.form.value.pageSize ?? 100,
    };

    // Step 1: Save Jira settings
    this.integrationService.upsertJiraSettings(orgId, req).subscribe({
      next: () => {
        // Step 2: Trigger Jira integration sync
        this.integrationService.syncIntegration(orgId).subscribe({
          next: (res) => {
            this.isSubmitting.set(false);
            this.syncResult.set(res);
            this.toast.success('Sync Complete', `Synced ${res.projectsSynced} project(s) and ${res.tasksSynced} task(s).`);
            this.synced.emit();
          },
          error: (err) => {
            this.isSubmitting.set(false);
            const errorMsg = err.error?.message || err.error?.title || 'Jira sync failed. Check your API credentials & Project Key.';
            this.toast.error('Sync Error', errorMsg);
            console.error('Jira sync error', err);
          }
        });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to save Jira settings';
        this.toast.error('Settings Error', errorMsg);
        console.error('Failed to save Jira settings', err);
      }
    });
  }
}
