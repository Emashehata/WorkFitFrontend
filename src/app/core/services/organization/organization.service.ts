// core/services/organization/organization.service.ts
import { Injectable, Injector, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Organization,
  OrganizationSettings,
  UpdateOrganizationRequest,
  OrganizationSettingsUpdate,
} from '../../models/organization.models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private http = inject(HttpClient);
  private injector = inject(Injector);
  private baseUrl = environment.baseUrl; 

  private _organization = signal<Organization | null>(null);
  readonly organization = this._organization.asReadonly();

  private _organizationSettings = signal<OrganizationSettings | null>(null);
  readonly organizationSettings = this._organizationSettings.asReadonly();

  private _hasOrganization = signal<boolean | null>(null);
  readonly hasOrganization = this._hasOrganization.asReadonly();

  private get authService(): AuthService {
    return this.injector.get(AuthService);
  }

  private requireUserId(): string {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) throw new Error('User not authenticated');
    return userId;
  }

  checkUserHasOrganization(): Observable<boolean> {
    const userId = this.authService.currentUser()?.userId;
    if (!userId) {
      this._hasOrganization.set(false);
      return of(false);
    }

    const params = new HttpParams().set('userId', userId);

    return this.http.get<Organization>(`${this.baseUrl}/organizations/me`, { params }).pipe(
      tap((org) => {
        this._organization.set(org);
        this._hasOrganization.set(true);
      }),
      map(() => true),
      catchError(() => {
        this._hasOrganization.set(false);
        return of(false);
      })
    );
  }

  getOrganization(): Observable<Organization> {
    const params = new HttpParams().set('userId', this.requireUserId());
    return this.http.get<Organization>(`${this.baseUrl}/organizations/me`, { params }).pipe(
      tap((org) => {
        this._organization.set(org);
        this._hasOrganization.set(true);
      })
    );
  }

  getOrganizationSettings(): Observable<OrganizationSettings> {
    const params = new HttpParams().set('userId', this.requireUserId());
    return this.http
      .get<OrganizationSettings>(`${this.baseUrl}/organizations/me/settings`, { params })
      .pipe(tap((settings) => this._organizationSettings.set(settings)));
  }

  // No orgId param — the real route is /me, not /{id}. userId goes in the body, per Swagger.
  updateOrganization(updateData: UpdateOrganizationRequest): Observable<Organization> {
    const body = { ...updateData, userId: this.requireUserId() };
    return this.http
      .put<Organization>(`${this.baseUrl}/organizations/me`, body)
      .pipe(tap((org) => this._organization.set(org)));
  }

  updateOrganizationSettings(settings: OrganizationSettingsUpdate): Observable<OrganizationSettings> {
    const body = { ...settings, userId: this.requireUserId() };
    return this.http
      .put<OrganizationSettings>(`${this.baseUrl}/organizations/me/settings`, body)
      .pipe(tap((updated) => this._organizationSettings.set(updated)));
  }


  clearOrganization(): void {
    this._organization.set(null);
    this._organizationSettings.set(null);
  }
}