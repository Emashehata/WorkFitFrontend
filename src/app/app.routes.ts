import { Routes } from '@angular/router';

import { RegisterOrganizationComponent } from './features/auth/register-organization/register-organization.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/organizationOwner/home/home.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout/dashboard-layout.component';
import { ProjectComponent } from './features/organizationOwner/project/project/project.component';
import { OrganizationSettingsComponent } from './features/organization/organization-settings/organization-settings.component';

import { paymentGuard } from './core/guards/payment.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'register',
    component: RegisterOrganizationComponent,
  },

  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },

      {
        path: 'projects',
        component: ProjectComponent,
      },

      {
        path: 'organization_settings',
        component: OrganizationSettingsComponent,
        canActivate: [paymentGuard],
      },

      {
        path: 'pricing',
        loadComponent: () =>
          import('./features/pricing/pricing.component').then(
            (m) => m.PricingComponent,
          ),
      },

      {
        path: 'payment-success',
        loadComponent: () =>
          import('./features/organizationOwner/payment-success/payment-success.component').then(
            (m) => m.PaymentSuccessComponent,
          ),
      },
      {
        path: 'integrations',
        loadComponent: () =>
          import('./features/integrations/integrations.component').then(
            (m) => m.IntegrationsComponent,
          ),
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/cv-upload/cv-upload.component').then(
            (m) => m.CvUploadComponent,
          ),
      }
    ],
  },
  {
    path: 'github/callback',
    loadComponent: () =>
      import('./features/integrations/github-callback/github-callback.component').then(
        (m) => m.GitHubCallbackComponent,
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
