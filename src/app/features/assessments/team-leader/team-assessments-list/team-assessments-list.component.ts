import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../../../core/services/assessment/assessment.service';
import { Assessment } from '../../../../core/models/assessment.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TalentManagementService } from '../../../../core/services/talent-management/talent-management.service';


type StatusFilter = 'All' | 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-team-assessments-list',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './team-assessments-list.component.html',
})
export class TeamAssessmentsListComponent implements OnInit {
  private assessmentService = inject(AssessmentService);
  private talentService = inject(TalentManagementService);
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
  this.assessmentService.getByTeamLead().subscribe();
}

  setFilter(filter: StatusFilter) {
    this.activeFilter.set(filter);
  }

  trackByAssessment(index: number, assessment: Assessment) {
    return assessment.assessmentId;
  }
}