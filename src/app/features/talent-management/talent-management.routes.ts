import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/enums/user-role.enum';

export const TALENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/employee-profile/employee-profile.component').then(
        (m) => m.EmployeeProfileComponent
      ),
  },
  {
    path: 'org-employees',
     
    loadComponent: () =>
      import('./employees-list/employees-list.component').then(
        (m) => m.EmployeesListComponent
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