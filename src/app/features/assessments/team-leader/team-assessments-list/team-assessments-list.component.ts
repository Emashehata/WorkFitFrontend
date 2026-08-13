import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { Assessment } from '../../../../core/models/assessment.model';
import { AssessmentService } from '../../../../core/services/assessment/assessment.service';
import { NgClass } from '@angular/common';


type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-team-assessments-list',
  standalone: true,
  imports: [RouterLink,NgClass],
  templateUrl: './team-assessments-list.component.html',
})
export class TeamAssessmentsListComponent implements OnInit {
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
    const teamLeadId = this.auth.currentUser()?.userId;
    if (teamLeadId) {
      this.assessmentService.getByTeamLead(teamLeadId).subscribe();
    }
  }

  setFilter(filter: StatusFilter) {
    this.activeFilter.set(filter);
  }

  trackByAssessment(index: number, assessment: Assessment) {
    return assessment.assessmentId;
  }
}