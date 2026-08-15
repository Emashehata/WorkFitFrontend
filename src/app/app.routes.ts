import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';
import { paymentGuard } from './core/guards/payment.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/enums/user-role.enum';
import { RegisterOrganizationComponent } from './features/auth/register-organization/register-organization.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/organizationOwner/home/home.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout/dashboard-layout.component';
import { ProjectComponent } from './features/organizationOwner/project/project/project.component';
import { ProjectDetailComponent } from './features/organizationOwner/project/project-detail/project-detail.component';
import { OrganizationSettingsComponent } from './features/organization/organization-settings/organization-settings.component';
import { EmployeesComponent } from './features/employee/employees/employees.component';
import { InvitationApprovalsComponent } from './features/organizationOwner/invitation-approvals/invitation-approvals.component';
import { AcceptInvitationComponent } from './features/invitations/accept-invitation/accept-invitation.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'register', component: RegisterOrganizationComponent, canActivate: [PublicGuard] },
  { path: 'invitations/accept', component: AcceptInvitationComponent },
  { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '', component: DashboardLayoutComponent, canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'my-team', component: EmployeesComponent },
      { path: 'projects', component: ProjectComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: 'organization_settings', component: OrganizationSettingsComponent, canActivate: [paymentGuard] },
      { path: 'invitation-approvals', component: InvitationApprovalsComponent, canActivate: [roleGuard], data: { roles: [UserRole.OrganizationOwner] } },
      { path: 'pricing', loadComponent: () => import('./features/pricing/pricing.component').then(m => m.PricingComponent) },
      { path: 'payment-success', loadComponent: () => import('./features/organizationOwner/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) },
      { path: 'integrations', loadComponent: () => import('./features/integrations/integrations.component').then(m => m.IntegrationsComponent) },
      { path: '', loadChildren: () => import('./features/assessments/assessment.routes').then(m => m.ASSESSMENT_ROUTES) },
      { path: '', loadChildren: () => import('./features/talent-management/talent-management.routes').then(m => m.TALENT_MANAGEMENT_ROUTES) },
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
        path: 'Cvs',
        loadComponent: () =>
          import('./features/cv-upload/cv-upload.component').then(
            (m) => m.CvUploadComponent,
          ),
      }
    ],
  },
  { path: 'github/callback', loadComponent: () => import('./features/integrations/github-callback/github-callback.component').then(m => m.GitHubCallbackComponent) },
  { path: '**', redirectTo: 'login' },
];