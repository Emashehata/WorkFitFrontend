import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterOrganizationRequest,
  RegisterOrganizationResponse,
  DecodedToken,
  CurrentUser,
} from '../../models/auth.models';
import { API_ROUTES } from '../../constants/api-routes.constant';
import { UserRole } from '../../enums/user-role.enum';

const TOKEN_KEY = 'workfit_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.baseUrl;

  private _currentUser = signal<CurrentUser | null>(
    this.readUserFromStoredToken(),
  );

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  // Primary Role
  readonly role = computed<UserRole | null>(() => {
    const roles = this.getUserRoles();
    return roles.length > 0 ? roles[0] : null;
  });

  // Role Signals
  readonly isSuperAdmin = computed(() =>
    this.hasRole(UserRole.SuperAdmin)
  );

  readonly isAdmin = computed(() =>
    this.hasRole(UserRole.Admin)
  );

  readonly isOrganizationOwner = computed(() =>
    this.hasRole(UserRole.OrganizationOwner)
  );

  readonly isTeamLeader = computed(() =>
    this.hasRole(UserRole.TeamLeader)
  );

  readonly isEmployee = computed(() =>
    this.hasRole(UserRole.Employee)
  );

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post(
        `${this.baseUrl}${API_ROUTES.identity.login}`,
        req,
        { responseType: 'text' }
      )
      .pipe(
        tap((token) => {
          localStorage.setItem(TOKEN_KEY, token);
          this._currentUser.set(this.decodeToUser(token));
        }),
      );
  }

  registerOrganization(
    req: RegisterOrganizationRequest,
  ): Observable<RegisterOrganizationResponse> {
    return this.http.post(
      `${this.baseUrl}${API_ROUTES.workflow.registerOrganization}`,
      req,
      { responseType: 'text' }
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? token.replace(/^"|"$/g, '') : null;
  }

  // =========================
  // Private Helpers
  // =========================

  private readUserFromStoredToken(): CurrentUser | null {
    const token = this.getToken();

    if (!token) return null;

    const user = this.decodeToUser(token);

    if (user && this.isExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return user;
  }

  private decodeToUser(token: string): CurrentUser | null {
    try {
      const decoded = jwtDecode<DecodedToken & Record<string, unknown>>(token);

      const roleClaimKey =
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

      const rawRoles =
        decoded.role ?? (decoded as any)[roleClaimKey];

      const roles = Array.isArray(rawRoles)
        ? rawRoles
        : rawRoles
          ? [rawRoles]
          : [];

      return {
        userId: decoded.sub,
        email: decoded.email,
        displayName: decoded.name,
        roles,
        orgId: decoded.OrgId,
      };
    } catch {
      return null;
    }
  }

  private isExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // =========================
  // Roles
  // =========================

  getUserRoles(): UserRole[] {
    return (this._currentUser()?.roles as UserRole[]) || [];
  }

  hasRole(role: UserRole): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every(role => this.hasRole(role));
  }
}