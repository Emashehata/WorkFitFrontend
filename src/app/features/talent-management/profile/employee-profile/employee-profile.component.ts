import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TalentManagementService } from '../../../../core/services/talent-management/talent-management.service';
import { SkillHistoryModalComponent } from '../../skill-history-modal/skill-history-modal.component';


@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [NgClass, FormsModule, SkillHistoryModalComponent],
  templateUrl: './employee-profile.component.html',
})
export class EmployeeProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private talentService = inject(TalentManagementService);
  private auth = inject(AuthService);

  profile = this.talentService.currentEmployee;
  loading = this.talentService.loading;

  canViewSkillHistory = computed(
    () => this.auth.isTeamLeader() || this.auth.isOrganizationOwner()
  );

  isOwnProfile = computed(() => !this.route.snapshot.paramMap.get('id'));

  activeSkillId: string | null = null;

  showGitHubForm = signal(false);
  githubAccountId = signal('');
  githubDisplayName = signal('');
  linkingGitHub = signal(false);

  initials = computed(() => {
    const name = this.profile()?.Name ?? '';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');

    if (paramId) {
      this.talentService.getEmployeeById(paramId).subscribe();
      return;
    }

    this.talentService.getMyProfile().subscribe();
  }

  openSkillHistory(skillId: string) {
    if (!this.canViewSkillHistory()) return;
    this.activeSkillId = skillId;
  }

  closeSkillHistory() {
    this.activeSkillId = null;
  }

  submitGitHubLink() {
    if (!this.githubAccountId() || !this.githubDisplayName()) return;

    this.linkingGitHub.set(true);
    this.talentService
      .linkGitHubAccount({
        gitHubAccountId: this.githubAccountId(),
        gitHubDisplayName: this.githubDisplayName(),
      })
      .pipe(finalize(() => this.linkingGitHub.set(false)))
      .subscribe(() => {
        this.showGitHubForm.set(false);
        this.githubAccountId.set('');
        this.githubDisplayName.set('');
      });
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-success/15 text-success';
      case 'Inactive':
        return 'bg-danger/15 text-danger';
      default:
        return 'bg-warning/15 text-warning';
    }
  }

  scoreColor(score: number): string {
    if (score >= 70) return 'bg-success';
    if (score >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  scorePercent(score: number): number {
    return Math.min(100, Math.max(0, score));
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}