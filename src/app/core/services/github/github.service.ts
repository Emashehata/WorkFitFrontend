import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpBackend } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../constants/api-routes.constant.ts';
import { AuthService } from '../auth/auth.service';
import {
  GitHubConnectionRequest,
  Organization,
  GitHubStatusResponse,
  GitHubOrgLookupResponse,
} from '../../models/organization.models';

const GITHUB_APP_SLUG = 'workfit-app';
const GITHUB_STATUS_CACHE_KEY = 'github_status_cache';

@Injectable({ providedIn: 'root' })
export class GitHubService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'https://localhost:7296/api';

  private plainHttp: HttpClient;

  constructor(handler: HttpBackend) {
    this.plainHttp = new HttpClient(handler);
  }

  /**
   * Step 1: Look up a GitHub organization by its login/name
   */
  lookupGitHubOrg(orgLogin: string): Observable<GitHubOrgLookupResponse> {
    const login = orgLogin.trim();
    return this.plainHttp
      .get<GitHubOrgLookupResponse>(`https://api.github.com/orgs/${encodeURIComponent(login)}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 404) {
            return throwError(() => new Error(`No GitHub organization found named "${login}".`));
          }
          return throwError(() => new Error('Failed to look up GitHub organization. Please try again.'));
        })
      );
  }

  /**
   * Step 2: Save the resolved org against the current user's organization
   */
  connectGitHub(request: GitHubConnectionRequest): Observable<Organization> {
    return this.http.put<Organization>(
      `${this.baseUrl}${API_ROUTES.organizations.meGithub}`,
      request
    ).pipe(
      tap((org) => {
        const status: GitHubStatusResponse = {
          organizationId: org.id,
          gitHubOrganizationId: org.gitHubOrganizationId || null,
          gitHubOrganizationLogin: org.gitHubOrganizationLogin || null,
          gitHubCreatedAt: org.gitHubCreatedAt || null,
        };
        this.setCachedStatus(status);
      })
    );
  }

  /**
   * Step 3: Open GitHub App installation in a NEW tab
   * User stays on the website while installation happens in a separate tab
   */
  redirectToInstallInNewTab(): void {
    const state = this.generateState();
    localStorage.setItem('github_oauth_state', state);
    const url = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new?state=${state}`;
    window.open(url, '_blank');
  }

  /**
   * Step 4: Redirect to GitHub App installation (same tab - fallback)
   */
  redirectToInstall(): void {
    const state = this.generateState();
    localStorage.setItem('github_oauth_state', state);
    window.location.href = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new?state=${state}`;
  }

  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Get cached GitHub connection status
   */
  getGitHubConnectionStatus(): Observable<GitHubStatusResponse> {
    const cached = this.getCachedStatus();
    if (cached) {
      return new Observable((subscriber) => {
        subscriber.next(cached);
        subscriber.complete();
      });
    }
    return new Observable((subscriber) => {
      subscriber.next({
        organizationId: '',
        gitHubOrganizationId: null,
        gitHubOrganizationLogin: null,
        gitHubCreatedAt: null,
      });
      subscriber.complete();
    });
  }

  private getCachedStatus(): GitHubStatusResponse | null {
    const cached = localStorage.getItem(GITHUB_STATUS_CACHE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  private setCachedStatus(status: GitHubStatusResponse): void {
    localStorage.setItem(GITHUB_STATUS_CACHE_KEY, JSON.stringify(status));
  }

 
}