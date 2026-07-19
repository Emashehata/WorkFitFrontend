import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { OrganizationService } from '../services/organization/organization.service';
import { AuthService } from '../services/auth/auth.service';


export const organizationGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const organizationService = inject(OrganizationService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) return true; // authGuard handles this case elsewhere

  const requireOrg = route.data['requireOrg'] !== false; // default: require an org

  return organizationService.checkUserHasOrganization().pipe(
    map((hasOrg) => {
      if (requireOrg && !hasOrg) {
        router.navigate(['/register']);
        return false;
      }
      if (!requireOrg && hasOrg) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true)) 
  );
};