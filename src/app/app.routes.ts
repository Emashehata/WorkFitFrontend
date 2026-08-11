import { organizationGuard } from './core/guards/organization.guard';
import { Routes } from '@angular/router';
import { RegisterOrganizationComponent } from './features/auth/register-organization/register-organization.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/organizationOwner/home/home.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout/dashboard-layout.component';
import { ProjectComponent } from './features/organizationOwner/project/project/project.component';
import { OrganizationSettingsComponent } from './features/organization/organization-settings/organization-settings.component';

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
    redirectTo: '',
  },
];