import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';
import {
  AlterSkillChange,
  AssessmentStatus,
} from '../../../../core/models/assessment.model';
import { TaskDetailDto } from '../../../../core/models/task.models';
import { AssessmentService } from '../../../../core/services/assessment/assessment.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TaskService } from '../../../../core/services/task/task.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AssessmentStatusLabelPipe } from '../../../../shared/pipes/assessment-status-label.pipe';

@Component({
  selector: 'app-assessment-detail',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ConfirmDialogComponent,
    AssessmentStatusLabelPipe,
  ],
  templateUrl: './assessment-detail.component.html',
})
export class AssessmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assessmentService = inject(AssessmentService);
  private taskService = inject(TaskService);
  private auth = inject(AuthService);

  protected readonly AssessmentStatus = AssessmentStatus;

  assessment = this.assessmentService.selectedAssessment;
  loading = this.assessmentService.loading;
  isTeamLead = this.auth.isTeamLeader;

  task = signal<TaskDetailDto | null>(null);
  taskLoading = signal(false);

  isAltering = signal(false);
  alteredScores = signal<Record<string, number>>({});
  alterNote = signal('');

  showApproveConfirm = signal(false);
  showRejectConfirm = signal(false);
  approveNote = signal('');
  rejectNote = signal('');

  submitting = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.assessmentService
      .getById(id)
      .pipe(
        switchMap((assessment) => {
          if (!assessment.taskId) return [null];

          this.taskLoading.set(true);
          return this.taskService.getTaskById(assessment.taskId).pipe(
            tap((task) => this.task.set(task)),
            finalize(() => this.taskLoading.set(false)),
          );
        }),
      )
      .subscribe();
  }

  toggleAlterMode() {
    if (!this.isAltering()) {
      const initial: Record<string, number> = {};
      this.assessment()?.skillChanges.forEach((sc) => {
        initial[sc.id] = sc.proposedScore;
      });
      this.alteredScores.set(initial);
    } else {
      this.alterNote.set('');
    }
    this.isAltering.update((v) => !v);
  }

  updateScore(id: string, value: string) {
    const num = Math.min(100, Math.max(0, Number(value)));
    this.alteredScores.update((scores) => ({ ...scores, [id]: num }));
  }

  alteredCount(): number {
    const current = this.assessment();
    if (!current) return 0;
    return current.skillChanges.filter(
      (sc) => this.alteredScores()[sc.id] !== sc.proposedScore,
    ).length;
  }

  scoreTier(score: number): 'low' | 'mid' | 'high' {
    if (score < 40) return 'low';
    if (score < 70) return 'mid';
    return 'high';
  }

  delta(oldScore: number, newScore: number): number {
    return newScore - oldScore;
  }

  submitAlter() {
    const current = this.assessment();
    if (!current) return;

    this.submitting.set(true);
    const skillChanges: AlterSkillChange[] = current.skillChanges.map((sc) => ({
      skillChangeId: sc.id,
      newScore: this.alteredScores()[sc.id] ?? sc.proposedScore,
      note: this.alterNote(),
    }));

    this.assessmentService
      .alter(current.assessmentId, { skillChanges, note: this.alterNote() })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe((updated) => {
        this.assessmentService.selectedAssessment.set(updated);
        this.isAltering.set(false);
        this.alterNote.set('');
      });
  }

  confirmApprove() {
    const current = this.assessment();
    if (!current) return;

    this.submitting.set(true);
    this.assessmentService
      .approve(current.assessmentId, { note: this.approveNote() })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => {
        this.assessmentService.updateLocalStatus(
          current.assessmentId,
          AssessmentStatus.Approved,
        );
        this.assessmentService.selectedAssessment.update((a) =>
          a ? { ...a, status: AssessmentStatus.Approved } : a,
        );
        this.showApproveConfirm.set(false);
        this.approveNote.set('');
      });
  }

  confirmReject() {
    const current = this.assessment();
    if (!current) return;

    this.submitting.set(true);
    this.assessmentService
      .reject(current.assessmentId, { note: this.rejectNote() })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe(() => {
        this.assessmentService.updateLocalStatus(
          current.assessmentId,
          AssessmentStatus.Rejected,
        );
        this.assessmentService.selectedAssessment.update((a) =>
          a ? { ...a, status: AssessmentStatus.Rejected } : a,
        );
        this.showRejectConfirm.set(false);
        this.rejectNote.set('');
      });
  }

  goBack() {
    const backRoute = this.isTeamLead()
      ? '/team-assessments'
      : '/my-assessments';
    this.router.navigate([backRoute]);
  }
}
