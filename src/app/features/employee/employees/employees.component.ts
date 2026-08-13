import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task/task.service';
import { ProjectService } from '../../../core/services/project/project.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { EmployeeListItemDto } from '../../../core/models/task.models';
import { Project } from '../../../core/models/project.models';
import { AddEmployeeModalComponent } from '../../../shared/components/add-employee-modal/add-employee-modal.component';

import { UserRole } from '../../../core/enums/user-role.enum';

export interface ProjectTeam {
  project: Project;
  members: (EmployeeListItemDto & { taskCount: number })[];
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, AddEmployeeModalComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  employees = signal<EmployeeListItemDto[]>([]);
  projectTeams = signal<ProjectTeam[]>([]);
  isLoading = signal(true);
  showAddEmployeeModal = signal(false);

  isTeamLeader = computed(() => this.authService.isTeamLeader() || this.authService.hasRole(UserRole.TeamLeader));

  ngOnInit() {
    this.loadEmployeesAndTeams();
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true' || params['create'] === 'true') {
        this.showAddEmployeeModal.set(true);
      }
    });
  }

  loadEmployeesAndTeams() {
    this.isLoading.set(true);

    // 1. Fetch all employees in organization
    this.taskService.getEmployees().subscribe({
      next: (allEmps) => {
        this.employees.set(allEmps);

        // 2. Fetch projects for team lead
        this.projectService.getProjectsForTeamLead().subscribe({
          next: (projects) => {
            if (!projects || projects.length === 0) {
              this.projectTeams.set([]);
              this.isLoading.set(false);
              return;
            }

            const teamPromises = projects.map(proj => {
              return new Promise<ProjectTeam>((resolve) => {
                this.taskService.getProjectTasks(proj.id).subscribe({
                  next: (tasks) => {
                    const assigneeMap = new Map<string, number>();
                    for (const t of tasks) {
                      if (t.assigneeId) {
                        assigneeMap.set(t.assigneeId, (assigneeMap.get(t.assigneeId) || 0) + 1);
                      }
                    }

                    const members: (EmployeeListItemDto & { taskCount: number })[] = [];
                    allEmps.forEach(emp => {
                      if (assigneeMap.has(emp.id)) {
                        members.push({
                          ...emp,
                          taskCount: assigneeMap.get(emp.id) || 0
                        });
                      }
                    });

                    resolve({ project: proj, members });
                  },
                  error: () => resolve({ project: proj, members: [] })
                });
              });
            });

            Promise.all(teamPromises).then(teams => {
              this.projectTeams.set(teams);
              this.isLoading.set(false);
            });
          },
          error: (err) => {
            console.error('Failed to load projects for team lead', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.isLoading.set(false);
      }
    });
  }
}
