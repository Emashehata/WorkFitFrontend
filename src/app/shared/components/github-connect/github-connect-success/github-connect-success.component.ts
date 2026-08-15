import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GitHubService } from '../../../../core/services/github/github.service';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-github-connect-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-300"
      >
        <!-- Header -->
        <div class="flex items-start justify-between mb-5">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center"
            >
              <i class="fa-brands fa-github text-emerald-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">GitHub Connected!</h3>
              <p class="text-xs text-gray-500">
                Installation completed successfully
              </p>
            </div>
          </div>
          <button
            (click)="close()"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Success Content -->
        <div class="py-4 text-center">
          <div
            class="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-4 animate-bounce"
          >
            <i class="fa-solid fa-check text-emerald-500 text-3xl"></i>
          </div>

          <h4 class="text-lg font-semibold text-gray-900">
            GitHub App Installed
          </h4>

          <p class="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            The GitHub App has been successfully installed on
            <span class="font-semibold text-gray-700">{{ orgName() }}</span
            >.
          </p>

          <div
            class="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3"
          >
            <div class="flex items-center gap-2 text-sm text-emerald-700">
              <i class="fa-solid fa-circle-check"></i>
              <span>Connected to {{ orgName() }}</span>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-2">
            <button
              (click)="goToDashboard()"
              class="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              <i class="fa-solid fa-rocket mr-2"></i>
              Go to Dashboard
            </button>
            <button
              (click)="close()"
              class="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
            >
              Stay on Integrations
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class GitHubConnectSuccessComponent {
  private router = inject(Router);
  private gitHubService = inject(GitHubService);
  private toast = inject(ToastService);

  @Output() closed = new EventEmitter<void>();

  orgName = signal('');

  constructor() {
    // ⭐ Get org name from cached status
    const status = this.gitHubService.getGitHubConnectionStatus();
    status.subscribe((s) => {
      this.orgName.set(s.gitHubOrganizationLogin || 'GitHub');
    });
  }

  close(): void {
    this.closed.emit();
  }

  goToDashboard(): void {
    this.closed.emit();
    this.router.navigate(['/home']);
  }
}
