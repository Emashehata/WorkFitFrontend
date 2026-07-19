// core/guards/public.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { OrganizationService } from '../services/organization/organization.service';

@Injectable({
  providedIn: 'root',
})
export class PublicGuard implements CanActivate {
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);

  canActivate(): Observable<boolean> | boolean {
    // If user is not authenticated, allow access to public pages
    if (!this.authService.isAuthenticated()) {
      return true;
    }

    // Check if user has an organization
    const storedHasOrg = localStorage.getItem('hasOrganization');

    if (storedHasOrg === 'true') {
      // User is authenticated and has organization - redirect to settings
      this.router.navigate(['/settings']);
      return false;
    }

    if (storedHasOrg === 'false') {
      // User is authenticated but doesn't have organization - allow access to register
      return true;
    }

    // If we don't know, check the API
    return this.organizationService.checkUserHasOrganization().pipe(
      map((hasOrganization) => {
        if (hasOrganization) {
          this.router.navigate(['/settings']);
          return false;
        }
        return true;
      }),
    );
  }
}
