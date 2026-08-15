import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ProjectService } from '../../../core/services/project/project.service';
import { TaskService } from '../../../core/services/task/task.service';
import { TaskListItem } from '../../../core/models/task.models';
import { TaskStatus } from '../../../core/enums/task-status.enum';
import { AddEmployeeModalComponent } from '../../../shared/components/add-employee-modal/add-employee-modal.component';

export interface UpcomingTaskItem {
  id?: string;
  projectId?: string;
  title: string;
  developer: string;
  dueDate: Date;
  dueLabel: string;
  priority: string;
  priorityClass: string;
  dotClass: string;
  bgClass: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AddEmployeeModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private router = inject(Router);

  userName = signal<string>('User');
  userEmail = signal<string>('');
  userRoles = signal<string[]>([]);
  organizationName = signal<string>('Your Organization');
  currentDate = signal<string>('');
  currentTime = signal<string>('');
  showAddEmployeeModal = signal<boolean>(false);
  showAllActivitiesModal = signal<boolean>(false);

  upcomingTasks = signal<UpcomingTaskItem[]>([]);
  recentActivities = signal<any[]>([]);

  sortedUpcomingTasks = computed(() => {
    return [...this.upcomingTasks()].sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
    );
  });

  // Dashboard statistics
  stats = signal([
    {
      label: 'Total Employees',
      value: '0',
      icon: 'users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Active Projects',
      value: '0',
      icon: 'projects',
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Pending Tasks',
      value: '0',
      icon: 'tasks',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Completion Rate',
      value: '0%',
      icon: 'chart',
      color: 'from-green-500 to-green-600',
    },
  ]);

  // Quick actions
  quickActions = signal([
    {
      label: 'Add Employee',
      icon: 'user-plus',
      color: 'bg-indigo-500',
      route: '/employees/add',
      queryParams: undefined as Record<string, string> | undefined
    },
    {
      label: 'Create Project',
      icon: 'folder-plus',
      color: 'bg-purple-500',
      route: '/projects',
      queryParams: { create: 'true' } as Record<string, string> | undefined
    },
    {
      label: 'Assign Tasks',
      icon: 'clipboard-list',
      color: 'bg-green-500',
      route: '/tasks/assign',
      queryParams: undefined as Record<string, string> | undefined
    },
    {
      label: 'Generate Report',
      icon: 'chart-bar',
      color: 'bg-orange-500',
      route: '/reports/generate',
      queryParams: undefined as Record<string, string> | undefined
    },
  ]);

  onActionClick(action: any, event: MouseEvent): void {
    if (action.label === 'Add Employee') {
      event.preventDefault();
      this.showAddEmployeeModal.set(true);
    }
  }

  onUpcomingTaskClick(task: UpcomingTaskItem): void {
    this.projectService.getProjectsForTeamLead().subscribe({
      next: (projects) => {
        if (projects && projects.length > 0) {
          const targetProjectId = task.projectId || projects[0].id;
          this.router.navigate(['/projects', targetProjectId], {
            queryParams: {
              highlightTaskId: task.id || '',
              highlightTaskTitle: task.title || ''
            }
          });
        } else {
          this.router.navigate(['/projects'], {
            queryParams: { highlightTaskTitle: task.title || '' }
          });
        }
      },
      error: () => {
        this.router.navigate(['/projects'], {
          queryParams: { highlightTaskTitle: task.title || '' }
        });
      }
    });
  }

  ngOnInit(): void {
    this.updateDateTime();
    setInterval(() => this.updateDateTime(), 1000);
    this.loadUserData();
    this.loadDashboardTasksAndActivities();
  }

  loadDashboardTasksAndActivities(): void {
    this.projectService.getProjectsForTeamLead().subscribe({
      next: (projects) => {
        if (!projects || projects.length === 0) {
          this.upcomingTasks.set([]);
          this.recentActivities.set([]);
          return;
        }

        const taskPromises = projects.map(p =>
          new Promise<(TaskListItem & { projectId: string })[]>((resolve) => {
            this.taskService.getProjectTasks(p.id).subscribe({
              next: tasks => resolve((tasks || []).map(t => ({ ...t, projectId: p.id }))),
              error: () => resolve([])
            });
          })
        );

        Promise.all(taskPromises).then(taskArrays => {
          const allTasks = taskArrays.flat();
          if (allTasks.length === 0) {
            this.upcomingTasks.set([]);
            this.recentActivities.set([]);
            return;
          }

          const upcomingItems: UpcomingTaskItem[] = allTasks
            .filter(t => t.status !== TaskStatus.Done)
            .map(t => ({
              id: t.id,
              projectId: t.projectId,
              title: t.title,
              developer: t.assigneeId ? 'Assigned Developer' : 'Unassigned',
              dueDate: t.dueDate ? new Date(t.dueDate) : new Date(Date.now() + 86400000),
              dueLabel: t.dueDate ? `Due ${new Date(t.dueDate).toLocaleDateString()}` : 'No Due Date',
              priority: `${t.priority} Priority`,
              priorityClass: t.priority === 'High' || t.priority === 'Critical' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700',
              dotClass: t.priority === 'High' || t.priority === 'Critical' ? 'bg-orange-500' : 'bg-blue-500',
              bgClass: 'bg-indigo-50/50 border-indigo-100'
            }));

          this.upcomingTasks.set(upcomingItems);
        });
      },
      error: () => {
        this.upcomingTasks.set([]);
        this.recentActivities.set([]);
      }
    });
  }

  updateDateTime(): void {
    const now = new Date();
    this.currentDate.set(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
    this.currentTime.set(
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }

  loadUserData(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(
        user.displayName || user.email?.split('@')[0] || 'User',
      );
      this.userEmail.set(user.email || '');
      this.userRoles.set(user.roles || []);

      if (user.email) {
        const domain = user.email.split('@')[1];
        if (domain) {
          const orgName = domain.split('.')[0];
          this.organizationName.set(
            orgName.charAt(0).toUpperCase() + orgName.slice(1),
          );
        }
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getRoleBadgeColor(role: string): string {
    const roleColors: { [key: string]: string } = {
      Admin: 'bg-red-100 text-red-700',
      Manager: 'bg-purple-100 text-purple-700',
      Employee: 'bg-blue-100 text-blue-700',
      HR: 'bg-pink-100 text-pink-700',
      Developer: 'bg-indigo-100 text-indigo-700',
    };
    return roleColors[role] || 'bg-gray-100 text-gray-700';
  }
}
