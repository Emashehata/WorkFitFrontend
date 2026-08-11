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
  // Public Routes
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

  // Dashboard Layout
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

      // هتزودي الباقي هنا
      // {
      //   path:'employees',
      //   component:EmployeesComponent
      // },
      //
      // {
      //   path:'projects',
      //   component:ProjectsComponent
      // }
    ],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
