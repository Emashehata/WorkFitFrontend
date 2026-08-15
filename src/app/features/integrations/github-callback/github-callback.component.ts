import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast/toast.service';

/**
 * Landing page for GitHub's install redirect
 * (https://github.com/apps/workfit-app/installations/new?state=...).
 *
 * By the time the user gets here, the org (id + login) has ALREADY been
 * saved via GitHubService.connectGitHub() in the "enter org name" modal
 * step. This page's only job is to confirm the installation step itself
 * completed (i.e. GitHub didn't cancel/error out) and reflect that back
 * to the user - it does NOT call the backend again.
 */
@Component({
  selector: 'app-github-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
    >
      <div class="text-center max-w-sm px-4">
        @if (isSuccess()) {
          <div
            class="bg-emerald-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center"
          >
            <i class="fa-solid fa-check text-3xl text-emerald-600"></i>
          </div>
          <h2 class="mt-4 text-2xl font-bold text-gray-900">
            GitHub Connected! 🎉
          </h2>
          <p class="text-gray-600">
            The GitHub App has been installed and your organization is linked.
          </p>
          <button
            (click)="goToIntegrations()"
            class="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Back to Integrations
          </button>
        } @else {
          <div
            class="bg-red-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center"
          >
            <i class="fa-solid fa-xmark text-3xl text-red-600"></i>
          </div>
          <h2 class="mt-4 text-2xl font-bold text-gray-900">
            Installation Not Completed
          </h2>
          <p class="text-gray-600">{{ errorMessage() }}</p>
          <div class="mt-4 flex flex-col items-center gap-2">
            <p class="text-sm text-gray-500">
              Your organization is still linked; you can install the GitHub App
              from Integrations at any time.
            </p>
            <button
              (click)="goToIntegrations()"
              class="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              Back to Integrations
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class GitHubCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isSuccess = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const installationId =
      this.route.snapshot.queryParamMap.get('installation_id');
    const setupAction = this.route.snapshot.queryParamMap.get('setup_action');
    const state = this.route.snapshot.queryParamMap.get('state');
    const error = this.route.snapshot.queryParamMap.get('error_description');
    const errorParam = this.route.snapshot.queryParamMap.get('error');

    // ⭐ CSRF check against the state we stored right before redirecting to install.
    const storedState = localStorage.getItem('github_oauth_state');
    localStorage.removeItem('github_oauth_state');

    if (error || errorParam) {
      this.fail(
        error || errorParam || 'GitHub App installation was cancelled.',
      );
      return;
    }

    if (state && storedState && state !== storedState) {
      this.fail('Invalid state parameter - possible CSRF attempt.');
      return;
    }

    // ⭐ setup_action=install (or a bare installation_id) means the user
    // completed the GitHub App install screen. We don't need to call our
    // backend again - the org was already saved before this redirect.
    if (installationId && (setupAction === 'install' || !setupAction)) {
      this.isSuccess.set(true);
      this.toast.success(
        'GitHub Connected!',
        'The GitHub App was installed successfully.',
      );
      setTimeout(() => this.router.navigate(['/integrations']), 2000);
      return;
    }

    this.fail('No installation ID was returned by GitHub.');
  }

  private fail(message: string): void {
    this.isSuccess.set(false);
    this.errorMessage.set(message);
    this.toast.error('Installation Not Completed', message);
  }

  goToIntegrations(): void {
    this.router.navigate(['/integrations']);
  }
}
