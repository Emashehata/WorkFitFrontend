import { organizationGuard } from './core/guards/organization.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';
import { Routes } from '@angular/router';
import { RegisterOrganizationComponent } from './features/auth/register-organization/register-organization.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/organizationOwner/home/home.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout/dashboard-layout.component';
import { ProjectComponent } from './features/organizationOwner/project/project/project.component';
import { ProjectDetailComponent } from './features/organizationOwner/project/project-detail/project-detail.component';
import { OrganizationSettingsComponent } from './features/organization/organization-settings/organization-settings.component';
import { EmployeesComponent } from './features/employee/employees/employees.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full',
    canActivate: [PublicGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [PublicGuard],
  },
  {
    path: 'register',
    component: RegisterOrganizationComponent,
    canActivate: [PublicGuard],
  },
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'employees',
        component: EmployeesComponent,
      },
      {
        path: 'projects',
        component: ProjectComponent,
      },
      {
        path: 'projects/:id',
        component: ProjectDetailComponent,
      },
      {
        path: 'organization_settings',
        component: OrganizationSettingsComponent,
      },


      {
        path: '',
        loadChildren: () =>
          import('./features/assessments/assessment.routes').then(
            (m) => m.ASSESSMENT_ROUTES
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];
