// core/auth/auth.service.ts
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

const TOKEN_KEY = 'workfit_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = environment.baseUrl;

  private _currentUser = signal<CurrentUser | null>(this.readUserFromStoredToken());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post(`${this.baseUrl}/identity/login`, req, { responseType: 'text' })
      .pipe(
        tap((token) => {
          localStorage.setItem(TOKEN_KEY, token);
          this._currentUser.set(this.decodeToUser(token));
        })
      );
  }

  registerOrganization(req: RegisterOrganizationRequest): Observable<RegisterOrganizationResponse> {
    return this.http.post(
      `${this.baseUrl}/workflow/organization/register`,
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
    return localStorage.getItem(TOKEN_KEY);
  }

  // --- private helpers ---

  private readUserFromStoredToken(): CurrentUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
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

      // ASP.NET's role claim serializes under the full schema URI, not "role" —
      // handle both shapes defensively rather than assume one.
      const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
      const rawRoles = decoded.role ?? (decoded as any)[roleClaimKey];
      const roles = Array.isArray(rawRoles) ? rawRoles : rawRoles ? [rawRoles] : [];

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