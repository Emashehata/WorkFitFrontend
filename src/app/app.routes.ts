import { organizationGuard } from './core/guards/organization.guard';
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
    canActivate: [PublicGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [PublicGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register-organization/register-organization.component').then(
        (m) => m.RegisterOrganizationComponent,
      ),
    canActivate: [PublicGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
    canActivate: [AuthGuard, organizationGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/organization/organization-settings/organization-settings.component')
      .then(m => m.OrganizationSettingsComponent),
    canActivate: [AuthGuard],
    data: { roles: ['TeamLeader'] }
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent,
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
