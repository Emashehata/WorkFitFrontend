import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssessmentService } from '../../../../core/services/assessment/assessment.service';
import {
  Assessment,
  AssessmentStatus,
} from '../../../../core/models/assessment.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TalentManagementService } from '../../../../core/services/talent-management/talent-management.service';
import { AssessmentStatusLabelPipe } from '../../../../shared/pipes/assessment-status-label.pipe';

type StatusFilter = 'All' | AssessmentStatus;

@Component({
  selector: 'app-team-assessments-list',
  standalone: true,
  imports: [RouterLink, NgClass, AssessmentStatusLabelPipe],
  templateUrl: './team-assessments-list.component.html',
})
export class TeamAssessmentsListComponent implements OnInit {
  private assessmentService = inject(AssessmentService);
  private talentService = inject(TalentManagementService);
  private auth = inject(AuthService);

  protected readonly AssessmentStatus = AssessmentStatus;

  assessments = this.assessmentService.assessments;
  loading = this.assessmentService.loading;

  activeFilter = signal<StatusFilter>('All');

  filters: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: AssessmentStatus.Pending },
    { label: 'Rejected', value: AssessmentStatus.Rejected },
    { label: 'Approved', value: AssessmentStatus.Approved },
  ];

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
