import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task/task.service';
import { ProjectService } from '../../../core/services/project/project.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { EmployeeListItemDto } from '../../../core/models/task.models';
import { Project } from '../../../core/models/project.models';
import { AddEmployeeModalComponent } from '../../../shared/components/add-employee-modal/add-employee-modal.component';
import { DeveloperProfileModalComponent } from '../../../shared/components/developer-profile-modal/developer-profile-modal.component';
import { UserRole } from '../../../core/enums/user-role.enum';

export interface ProjectTeam {
  project: Project;
  members: (EmployeeListItemDto & { taskCount: number })[];
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, AddEmployeeModalComponent, DeveloperProfileModalComponent],
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

  showProfileModal = signal(false);
  selectedDeveloperId = signal('');
  selectedDeveloperName = signal('');

  isTeamLeader = computed(() => this.authService.isTeamLeader() || this.authService.hasRole(UserRole.TeamLeader));

  ngOnInit() {
    this.loadEmployeesAndTeams();
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true' || params['create'] === 'true') {
        this.showAddEmployeeModal.set(true);
      }
    });
  }

  openDeveloperProfile(empId: string, empName: string) {
    this.selectedDeveloperId.set(empId);
    this.selectedDeveloperName.set(empName);
    this.showProfileModal.set(true);
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
                let projectMembers: EmployeeListItemDto[] = [];
                let taskCounts = new Map<string, number>();
                let completedRequests = 0;

                const finish = () => {
                  completedRequests++;
                  if (completedRequests < 2) return;

                  resolve({
                    project: proj,
                    members: projectMembers.map(member => ({
                      ...member,
                      taskCount: taskCounts.get(member.id) || 0,
                    })),
                  });
                };

                this.projectService.getProjectMembers(proj.id).subscribe({
                  next: members => {
                    projectMembers = members.map(member => ({
                      ...member,
                      email: member.email ?? '',
                    }));
                    finish();
                  },
                  error: finish,
                });

                this.taskService.getProjectTasks(proj.id).subscribe({
                  next: tasks => {
                    taskCounts = new Map<string, number>();
                    for (const task of tasks) {
                      if (task.assigneeId) {
                        taskCounts.set(task.assigneeId, (taskCounts.get(task.assigneeId) || 0) + 1);
                      }
                    }
                    finish();
                  },
                  error: finish,
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
