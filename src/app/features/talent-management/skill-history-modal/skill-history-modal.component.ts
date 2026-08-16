import { Component, OnInit, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TalentManagementService } from '../../../core/services/talent-management/talent-management.service';


@Component({
  selector: 'app-skill-history-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './skill-history-modal.component.html',
})
export class SkillHistoryModalComponent implements OnInit {
  private talentService = inject(TalentManagementService);

  skillId = input.required<string>();
  employeeId = input.required<string>();
  closed = output<void>();

  skillDetail = this.talentService.selectedSkill;
  loading = this.talentService.loading;

  ngOnInit(): void {
    this.talentService.getEmployeeSkill(this.skillId(), this.employeeId()).subscribe();
  }

  onClose() {
    this.talentService.selectedSkill.set(null);
    this.closed.emit();
  }
}