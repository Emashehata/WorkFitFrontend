import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Assessment } from '../../../../core/models/assessment.model';
import { AssessmentService } from '../../../../core/services/assessment/assessment.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NgClass } from '@angular/common';
 

type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-my-assessments-list',
  standalone: true,
  imports: [RouterLink,NgClass],
  templateUrl: './my-assessments-list.component.html',
})
export class MyAssessmentsListComponent implements OnInit {
  private assessmentService = inject(AssessmentService);
  private auth = inject(AuthService);

  assessments = this.assessmentService.assessments;
  loading = this.assessmentService.loading;

  activeFilter = signal<StatusFilter>('All');
  filters: StatusFilter[] = ['All', 'Pending', 'Approved', 'Rejected'];

  filteredAssessments = computed(() => {
    const filter = this.activeFilter();
    const list = this.assessments();
    if (filter === 'All') return list;
    return list.filter((a) => a.status === filter);
  });

  ngOnInit(): void {
    // employeeId هنا هو الـ employeeProfileId؛ لو الـ backend محتاج
    // Employee Profile Id منفصل عن الـ userId بتاع الـ JWT، هتحتاجي تجيبيه
    // من endpoint تاني (زي GET /api/employee-profile/me) بدل ما تاخديه من الـ token مباشرة
    const employeeProfileId = this.auth.currentUser()?.userId;
    if (employeeProfileId) {
      this.assessmentService.getByEmployeeProfile(employeeProfileId).subscribe();
    }
  }

  setFilter(filter: StatusFilter) {
    this.activeFilter.set(filter);
  }

  trackByAssessment(index: number, assessment: Assessment) {
    return assessment.assessmentId;
  }
}