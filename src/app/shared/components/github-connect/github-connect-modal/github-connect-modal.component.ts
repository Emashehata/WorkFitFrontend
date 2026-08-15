import {
  Component,
  EventEmitter,
  Output,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubService } from '../../../../core/services/github/github.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { GitHubConnectionRequest } from '../../../../core/models/organization.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-github-connect-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './github-connect-modal.component.html',
})
export class GitHubConnectModalComponent {
  private gitHubService = inject(GitHubService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  @Output() closed = new EventEmitter<void>();
  @Output() connected = new EventEmitter<void>();

  orgLogin = signal('');
  isSubmitting = signal(false);
  errorMessage = signal('');
  step = signal<'enter' | 'connecting' | 'success' | 'error'>('enter');
  installedOrgName = signal('');

  isValid = computed(() => this.orgLogin().trim().length > 0);
  isStep = (step: string) => this.step() === step;

  close(): void {
    if (this.isSubmitting()) return;
    this.closed.emit();
  }

  submit(): void {
    const login = this.orgLogin().trim();
    if (!login) {
      this.errorMessage.set('Please enter your GitHub organization name.');
      return;
    }

    const userId = this.authService.currentUser()?.userId;
    if (!userId) {
      this.errorMessage.set('You must be logged in to connect GitHub.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.step.set('connecting');

    this.gitHubService.lookupGitHubOrg(login).subscribe({
      next: (org) => {
        const request: GitHubConnectionRequest = {
          userId: userId,
          gitHubOrganizationId: org.id,
          gitHubOrganizationLogin: org.login,
        };

        this.gitHubService.connectGitHub(request).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.step.set('success');
            this.installedOrgName.set(org.login);
            this.toast.success(
              'Organization linked',
              `Linked to ${org.login}. Opening GitHub App installation...`,
            );
            this.connected.emit();

            // ⭐ Open GitHub installation in NEW tab
            setTimeout(() => {
              this.gitHubService.redirectToInstallInNewTab();
            }, 1000);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.step.set('error');
            const message =
              err.error?.message ||
              err.error?.userFriendlyMessage ||
              'Failed to save GitHub organization.';
            this.errorMessage.set(message);
          },
        });
      },
      error: (err: Error) => {
        this.isSubmitting.set(false);
        this.step.set('error');
        this.errorMessage.set(
          err.message || 'Organization not found on GitHub.',
        );
      },
    });
  }

  goToIntegrations(): void {
    this.closed.emit();
    this.router.navigate(['/integrations']);
  }

  reset(): void {
    this.step.set('enter');
    this.errorMessage.set('');
    this.orgLogin.set('');
  }

  tryAgain(): void {
    this.reset();
  }
}
