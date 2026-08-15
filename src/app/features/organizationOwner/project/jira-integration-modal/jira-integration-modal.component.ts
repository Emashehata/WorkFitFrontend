import { Component, inject, input, output, signal, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { IntegrationService } from '../../../../core/services/integration/integration.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { SyncResult, UnknownDeveloper } from '../../../../core/models/integration.models';
import { InvitationService } from '../../../../core/services/invitation/invitation.service';

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
  private invitationService = inject(InvitationService);

  isLoadingSettings = signal(false);
  isSubmitting = signal(false);
  syncResult = signal<SyncResult | null>(null);
  invitationEmails = signal<Record<string, string>>({});
  invitationStates = signal<Record<string, 'idle' | 'submitting' | 'pending' | 'error'>>({});
  invitationErrors = signal<Record<string, string>>({});

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
            this.invitationEmails.set(Object.fromEntries(
              (res.unknownDevelopers ?? []).map((developer) => [this.developerKey(developer), developer.email ?? '']),
            ));
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

  developerKey(developer: UnknownDeveloper): string {
    return `${developer.projectId}:${developer.employeeProfileId}:${developer.sourceAccountId}`;
  }

  updateInvitationEmail(developer: UnknownDeveloper, event: Event): void {
    const key = this.developerKey(developer);
    const email = (event.target as HTMLInputElement).value;
    this.invitationEmails.update((emails) => ({ ...emails, [key]: email }));
    this.invitationErrors.update((errors) => ({ ...errors, [key]: '' }));
  }

  requestInvitation(developer: UnknownDeveloper): void {
    const key = this.developerKey(developer);
    const currentState = this.invitationState(developer);
    if (currentState === 'submitting' || currentState.toLowerCase() === 'pending') {
      return;
    }
    const email = (this.invitationEmails()[key] ?? developer.email ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.invitationErrors.update((errors) => ({
        ...errors,
        [key]: 'Enter a valid email address before requesting.',
      }));
      return;
    }

    this.invitationStates.update((states) => ({ ...states, [key]: 'submitting' }));
    this.invitationService.requestInvitation({
      projectId: developer.projectId,
      employeeProfileId: developer.employeeProfileId,
      sourceAccountId: developer.sourceAccountId,
      email,
    }).subscribe({
      next: () => {
        this.invitationStates.update((states) => ({ ...states, [key]: 'pending' }));
        this.invitationErrors.update((errors) => ({ ...errors, [key]: '' }));
        this.toast.success('Invitation requested', `${developer.displayName} is awaiting owner approval.`);
      },
      error: (err) => {
        this.invitationStates.update((states) => ({ ...states, [key]: 'error' }));
        this.invitationErrors.update((errors) => ({
          ...errors,
          [key]: err?.error?.message || err?.error?.title || err?.error?.userFriendlyMessage || 'Invitation request failed.',
        }));
      },
    });
  }

  invitationState(developer: UnknownDeveloper): string {
    const state = this.invitationStates()[this.developerKey(developer)] ?? developer.invitationStatus;
    return state.toLowerCase() === 'pending' ? 'pending' : state;
  }
}
