import { organizationGuard } from './core/guards/organization.guard';
import { Routes } from '@angular/router';
import { RegisterOrganizationComponent } from './features/auth/register-organization/register-organization.component';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/organizationOwner/home/home.component';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout/dashboard-layout.component';


export const routes: Routes = [

  // Public Routes
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterOrganizationComponent
  },

  // Dashboard Layout
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [

      {
        path: 'home',
        component: HomeComponent
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

    ]
  },

  {
    path: '**',
    redirectTo: ''
  }

];