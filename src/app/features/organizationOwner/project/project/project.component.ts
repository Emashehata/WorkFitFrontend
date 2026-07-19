import { Component, inject } from '@angular/core';
import { Project } from '../../../../core/models/project.models';
import { ProjectService } from '../../../../core/services/project/project.service';
import { CardComponent } from "../../../../shared/components/card/card.component";
import { BadgeComponent } from "../../../../shared/components/badge/badge.component";
import { ButtonComponent } from "../../../../shared/components/button/button/button.component";
import { DatePipe } from '@angular/common';
import { BadgeVariant } from '../../../../core/models/badge.model';


@Component({
  selector: 'app-project',
  imports: [CardComponent, BadgeComponent, ButtonComponent, DatePipe],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent {
  projects: Project[] = [];

  statusConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
    Planning:  { variant: 'warning', icon: 'fa-solid fa-hourglass-half' },
    Active:    { variant: 'success', icon: 'fa-solid fa-play' },
    Completed: { variant: 'info',    icon: 'fa-solid fa-circle-check' },
    OnHold:    { variant: 'neutral', icon: 'fa-solid fa-pause' },
    Cancelled: { variant: 'danger',  icon: 'fa-solid fa-circle-xmark' },
  };

  private projectService = inject(ProjectService);

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.projectService.getProjects().subscribe({
      next: (res) => {
        this.projects = res;
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onView(project: Project) {
    // navigate to details
  }

  onEdit(project: Project) {
    // navigate to edit
  }

  onDelete(project: Project) {
    // confirm + delete
  }
  getStatusConfig(status: string) {
  return this.statusConfig[status] ?? { variant: 'neutral' as BadgeVariant, icon: 'fa-solid fa-circle-question' };
}
}