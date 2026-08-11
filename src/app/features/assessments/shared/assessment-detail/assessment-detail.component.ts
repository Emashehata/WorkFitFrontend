import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlterSkillChange } from '../../../../core/models/assessment.model';
import { AssessmentService } from '../../../../core/services/assessment/assessment.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NgClass } from '@angular/common';


@Component({
  selector: 'app-assessment-detail',
  standalone: true,
  imports: [FormsModule, ConfirmDialogComponent,NgClass],
  templateUrl: './assessment-detail.component.html',
})
export class AssessmentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assessmentService = inject(AssessmentService);
  private auth = inject(AuthService);

  assessment = this.assessmentService.selectedAssessment;
  loading = this.assessmentService.loading;

  // computed جاهز في الـ AuthService، متعملهوش تاني
  isTeamLead = this.auth.isTeamLeader;

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
    if (id) {
      this.assessmentService.getById(id).subscribe();
    }
  }

  toggleAlterMode() {
    if (!this.isAltering()) {
      const initial: Record<string, number> = {};
      this.assessment()?.skillChanges.forEach((sc) => {
        initial[sc.skillChangeId] = sc.proposedScore;
      });
      this.alteredScores.set(initial);
    }
    this.isAltering.update((v) => !v);
  }

  updateScore(skillChangeId: string, value: string) {
    const num = Number(value);
    this.alteredScores.update((scores) => ({
      ...scores,
      [skillChangeId]: num,
    }));
  }

  submitAlter() {
    const current = this.assessment();
    if (!current) return;

    this.submitting.set(true);
    const skillChanges: AlterSkillChange[] = current.skillChanges.map(
      (sc) => ({
        skillChangeId: sc.skillChangeId,
        newScore: this.alteredScores()[sc.skillChangeId] ?? sc.proposedScore,
        note: this.alterNote(),
      })
    );

    this.assessmentService
      .alter(current.assessmentId, { skillChanges, note: this.alterNote() })
      .subscribe({
        next: (updated) => {
          this.assessmentService.selectedAssessment.set(updated);
          this.isAltering.set(false);
          this.alterNote.set('');
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false),
      });
  }

  confirmApprove() {
    const current = this.assessment();
    if (!current) return;

    this.submitting.set(true);
    this.assessmentService
      .approve(current.assessmentId, { note: this.approveNote() })
      .subscribe({
        next: () => {
          this.assessmentService.updateLocalStatus(current.assessmentId, 'Approved');
          this.assessmentService.selectedAssessment.update((a) =>
            a ? { ...a, status: 'Approved' } : a
          );
          this.showApproveConfirm.set(false);
          this.approveNote.set('');
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false),
      });
  }

  confirmReject() {
    const current = this.assessment();
    if (!current) return;

    this.submitting.set(true);
    this.assessmentService
      .reject(current.assessmentId, { note: this.rejectNote() })
      .subscribe({
        next: () => {
          this.assessmentService.updateLocalStatus(current.assessmentId, 'Rejected');
          this.assessmentService.selectedAssessment.update((a) =>
            a ? { ...a, status: 'Rejected' } : a
          );
          this.showRejectConfirm.set(false);
          this.rejectNote.set('');
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false),
      });
  }

  goBack() {
    const backRoute = this.isTeamLead() ? '/team-assessments' : '/my-assessments';
    this.router.navigate([backRoute]);
  }
}