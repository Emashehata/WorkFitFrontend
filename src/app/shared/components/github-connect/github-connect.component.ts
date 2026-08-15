import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { GitHubService } from '../../../core/services/github/github.service';
import { GitHubStatusResponse } from '../../../core/models/organization.models';
import { GitHubConnectModalComponent } from './github-connect-modal/github-connect-modal.component';
import { GitHubConnectSuccessComponent } from './github-connect-success/github-connect-success.component';
import { ToastService } from '../../../core/services/toast/toast.service';

@Component({
  selector: 'app-github-connect',
  standalone: true,
  imports: [CommonModule, DatePipe, GitHubConnectModalComponent, GitHubConnectSuccessComponent],
  templateUrl: './github-connect.component.html',
  styleUrls: ['./github-connect.component.scss'],
})
export class GitHubConnectComponent implements OnInit, OnDestroy {
  private gitHubService = inject(GitHubService);
  private router = inject(Router);
  private toast = inject(ToastService);

  status = signal<GitHubStatusResponse | null>(null);
  isLoading = signal(true);
  loadFailed = signal(false);
  showConnectModal = signal(false);
  showSuccessModal = signal(false);

  isConnected = computed(() => !!this.status()?.gitHubOrganizationLogin);
  orgName = computed(() => this.status()?.gitHubOrganizationLogin || '');
  connectionDate = computed(() => this.status()?.gitHubCreatedAt);

  // ⭐ Mock data for visualization
  stats = computed(() => ({
    repos: Math.floor(Math.random() * 50) + 10,
    commits: Math.floor(Math.random() * 500) + 100,
    prs: Math.floor(Math.random() * 100) + 10,
  }));

  private onVisibilityChange = () => {
    if (document.visibilityState === 'visible') this.refreshStatus();
  };

  ngOnInit(): void {
    this.refreshStatus();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  refreshStatus(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);

    this.gitHubService.getGitHubConnectionStatus().subscribe({
      next: (status) => {
        this.status.set(status);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  connect(): void {
    this.showConnectModal.set(true);
  }

  onModalClosed(): void {
    this.showConnectModal.set(false);
  }

  onModalConnected(): void {
    this.showConnectModal.set(false);
    setTimeout(() => {
      this.showSuccessModal.set(true);
      this.refreshStatus();
    }, 500);
  }

  onSuccessModalClosed(): void {
    this.showSuccessModal.set(false);
    this.refreshStatus();
  }

  viewOnGitHub(): void {
    window.open(`https://github.com/${this.orgName()}`, '_blank');
  }
}