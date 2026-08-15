// features/talent-management/talent-management.routes.ts
import { Routes } from '@angular/router';

export const TALENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/employee-profile/employee-profile.component').then(
        (m) => m.EmployeeProfileComponent
      ),
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('./profile/employee-profile/employee-profile.component').then(
        (m) => m.EmployeeProfileComponent
      ),
  },
];