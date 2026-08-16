import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/enums/user-role.enum';

export const ASSESSMENT_ROUTES: Routes = [
  {
    path: 'my-assessments',
    canActivate: [roleGuard],
    data: { roles: [UserRole.Employee] },
    loadComponent: () =>
      import('./employee/my-assessments-list/my-assessments-list.component').then(
        (m) => m.MyAssessmentsListComponent
      ),
  },
  {
    path: 'my-assessments/:id',  
    canActivate: [roleGuard],
    data: { roles: [UserRole.Employee] },
    loadComponent: () =>
      import('./shared/assessment-detail/assessment-detail.component').then(
        (m) => m.AssessmentDetailComponent
      ),
  },
  // Same fix for team-assessments
  {
    path: 'team-assessments',
    canActivate: [roleGuard],
    data: { roles: [UserRole.TeamLeader] },
    loadComponent: () =>
      import('./team-leader/team-assessments-list/team-assessments-list.component').then(
        (m) => m.TeamAssessmentsListComponent
      ),
  },
  {
    path: 'team-assessments/:id',  
    canActivate: [roleGuard],
    data: { roles: [UserRole.TeamLeader] },
    loadComponent: () =>
      import('./shared/assessment-detail/assessment-detail.component').then(
        (m) => m.AssessmentDetailComponent
      ),
  },
];