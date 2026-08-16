import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, switchMap, map, of } from 'rxjs';
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
  private baseUrl = 'https://localhost:7296/api';

  private _currentUser = signal<CurrentUser | null>(
    this.readUserFromStoredToken(),
  );
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  // ⭐ Organization ID cache
  private _organizationId = signal<string | null>(null);
  readonly organizationId = this._organizationId.asReadonly();
  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post(`${this.baseUrl}${API_ROUTES.identity.login}`, req, {
        responseType: 'text',
      })
      .pipe(
        tap((token) => {
          // Clean the token
          const cleanToken = this.cleanToken(token);
          localStorage.setItem(TOKEN_KEY, cleanToken);
          this._currentUser.set(this.decodeToUser(cleanToken));
          // ⭐ Fetch organization ID after login
          this.fetchOrganizationId().subscribe();
        }),
      );
  }
  readonly role = computed<UserRole | null>(
    () => this.getUserRoles()[0] ?? null,
  );
  readonly isSuperAdmin = computed(() => this.hasRole(UserRole.SuperAdmin));
  readonly isAdmin = computed(() => this.hasRole(UserRole.Admin));
  readonly isOrganizationOwner = computed(() =>
    this.hasRole(UserRole.OrganizationOwner),
  );
  readonly isTeamLeader = computed(() => this.hasRole(UserRole.TeamLeader));
  readonly isEmployee = computed(() => this.hasRole(UserRole.Employee));
  // ⭐ Register Organization
  registerOrganization(
    req: RegisterOrganizationRequest,
  ): Observable<RegisterOrganizationResponse> {
    return this.http.post(
      `${this.baseUrl}${API_ROUTES.workflow.registerOrganization}`,
      req,
      { responseType: 'text' },
    );
  }

  // ⭐ Logout
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
    this._organizationId.set(null);
    this.router.navigate(['/login']);
    localStorage.clear(); // Clears ALL localStorage data
  }

  // ⭐ Get Token (with cleaning)
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    return this.cleanToken(token);
  }

  // ⭐ Clean Token - removes quotes and trims
  private cleanToken(token: string): string {
    return token.replace(/^"|"$/g, '').trim();
  }

  // ⭐ ==================== ORGANIZATION ID ====================

  /**
   * Fetch organization ID for the current user
   * GET /api/organizations/me/id?userId={userId}
   */
  fetchOrganizationId(): Observable<string> {
    const userId = this._currentUser()?.userId;
    if (!userId) {
      return of('');
    }

    const params = new HttpParams().set('userId', userId);

    return this.http
      .get<string>(`${this.baseUrl}${API_ROUTES.organizations.meId}`, {
        params,
        responseType: 'text' as 'json',
      })
      .pipe(
        tap((orgId) => {
          // Clean the response (remove quotes if present)
          const cleanOrgId = orgId.replace(/^"|"$/g, '').trim();
          this._organizationId.set(cleanOrgId);
          // ⭐ Also store in localStorage for persistence
          localStorage.setItem('workfit_organization_id', cleanOrgId);
        }),
      );
  }

  /**
   * Get organization ID from cache or fetch if not available
   */
  getOrganizationId(): Observable<string> {
    // ⭐ Check cache first
    const cached = this._organizationId();
    if (cached) {
      return of(cached);
    }

    // ⭐ Check localStorage
    const stored = localStorage.getItem('workfit_organization_id');
    if (stored) {
      this._organizationId.set(stored);
      return of(stored);
    }

    // ⭐ Fetch from API
    return this.fetchOrganizationId();
  }

  /**
   * Get organization ID synchronously (if already loaded)
   */
  getOrganizationIdSync(): string | null {
    return this._organizationId();
  }

  // ⭐ ==================== ROLE HELPERS ====================

  getUserRoles(): UserRole[] {
    return (this._currentUser()?.roles as UserRole[]) || [];
  }
  hasRole(role: UserRole): boolean {
    return this.getUserRoles().includes(role);
  }
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }
  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  // ⭐ ==================== PRIVATE HELPERS ====================

  private readUserFromStoredToken(): CurrentUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const cleanToken = this.cleanToken(token);
    const user = this.decodeToUser(cleanToken);
    if (user && this.isExpired(cleanToken)) {
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
      const rawRoles = decoded.role ?? (decoded as any)[roleClaimKey];
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
}