import { Component, OnInit, inject, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { TalentManagementService } from '../../../../core/services/talent-management/talent-management.service';
import { SkillHistoryModalComponent } from '../../skill-history-modal/skill-history-modal.component';


@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [NgClass, SkillHistoryModalComponent],
  templateUrl: './employee-profile.component.html',
})
export class EmployeeProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private talentService = inject(TalentManagementService);
  private auth = inject(AuthService);

  profile = this.talentService.currentEmployee;
  loading = this.talentService.loading;

  // بس الـ Team Leader هو اللي يقدر يفتح الـ skill history
  canViewSkillHistory = this.auth.isTeamLeader;

  activeSkillId: string | null = null;

  initials = computed(() => {
    const name = this.profile()?.name ?? '';
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
      // فيه id في الراوت = بنشوف بروفايل حد تاني
      this.talentService.getEmployeeById(paramId).subscribe();
      return;
    }

    // مفيش id = بنشوف بروفايلنا احنا
    const userId = this.auth.currentUser()?.userId;
    if (userId) {
      this.talentService.getEmployeeById(userId).subscribe();
    }
  }

  openSkillHistory(skillId: string) {
    if (!this.canViewSkillHistory()) return;
    this.activeSkillId = skillId;
  }

  closeSkillHistory() {
    this.activeSkillId = null;
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
    if (score >= 4) return 'bg-success';
    if (score >= 2) return 'bg-warning';
    return 'bg-danger';
  }

  scorePercent(score: number): number {
    return Math.min(100, Math.max(0, (score / 5) * 100));
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}