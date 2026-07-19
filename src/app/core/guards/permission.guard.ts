// core/guards/permission.guard.ts
import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const requiredPermission = route.data['permission'] as string;

    if (!requiredPermission) {
      return true;
    }

    // This is a placeholder - you'll implement actual permission checking
    // based on your application's permission system
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // Example: Check if user has the required permission
    const hasPermission = this.hasPermission(user, requiredPermission);

    if (hasPermission) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }

  private hasPermission(user: any, permission: string): boolean {
    
    return (
      user.roles?.some(
        (role: string) => role === 'Admin' || role === 'Manager',
      ) || false
    );
  }
}
