// core/guards/claims.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export type ClaimRequirement = {
  type: 'role' | 'permission' | 'scope';
  value: string | string[];
};

@Injectable({
  providedIn: 'root'
})
export class ClaimsGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const claims = route.data['claims'] as ClaimRequirement[];
    
    if (!claims || claims.length === 0) {
      return true;
    }

    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasAllClaims = claims.every(claim => this.checkClaim(user, claim));
    
    if (hasAllClaims) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }

  private checkClaim(user: any, claim: ClaimRequirement): boolean {
    switch (claim.type) {
      case 'role':
        const roles = Array.isArray(claim.value) ? claim.value : [claim.value];
        return user.roles?.some((role: string) => roles.includes(role)) || false;
      
      case 'permission':
        return true;
      
      case 'scope':
        return true;
      
      default:
        return false;
    }
  }
}