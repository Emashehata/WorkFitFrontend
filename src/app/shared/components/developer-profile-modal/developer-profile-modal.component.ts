import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { TaskService } from '../../../core/services/task/task.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { EmployeeDetailsDto, DeveloperTask } from '../../../core/models/task.models';
import { TaskStatus } from '../../../core/enums/task-status.enum';

export interface GroupedProjectTasks {
  projectName: string;
  projectId: string;
  tasks: DeveloperTask[];
}

@Component({
  selector: 'app-developer-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './developer-profile-modal.component.html',
  styleUrl: './developer-profile-modal.component.scss'
})
export class DeveloperProfileModalComponent {
  isOpen = input<boolean>(false);
  employeeId = input<string>('');
  employeeName = input<string>('');
  close = output<void>();
  updated = output<void>();

  private taskService = inject(TaskService);
  private toast = inject(ToastService);

  isLoading = signal(false);
  updatingTaskId = signal<string | null>(null);
  profile = signal<EmployeeDetailsDto | null>(null);
  assignedTasks = signal<DeveloperTask[]>([]);

  statusOptions = [
    { value: 0, label: 'Todo', badgeClass: 'bg-amber-100 text-amber-800' },
    { value: 1, label: 'In Progress', badgeClass: 'bg-blue-100 text-blue-800' },
    { value: 2, label: 'Under Review', badgeClass: 'bg-purple-100 text-purple-800' },
    { value: 3, label: 'Completed', badgeClass: 'bg-emerald-100 text-emerald-800' }
  ];

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const empId = this.employeeId();
      if (open && empId) {
        this.loadProfileAndTasks(empId);
      }
    });
  }

  loadProfileAndTasks(empId: string) {
    this.isLoading.set(true);
    this.profile.set(null);
    this.assignedTasks.set([]);

    // 1. Load Employee Details
    this.taskService.getEmployeeById(empId).subscribe({
      next: (data) => {
        this.profile.set(data);
      },
      error: (err) => {
        console.warn('Could not load detailed employee profile', err);
      }
    });

    // 2. Load Assigned Tasks
    this.taskService.getDeveloperAssignedTasks(empId).subscribe({
      next: (tasks) => {
        this.assignedTasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load developer assigned tasks', err);
        this.isLoading.set(false);
      }
    });
  }

  get groupedTasks(): GroupedProjectTasks[] {
    const tasks = this.assignedTasks();
    const map = new Map<string, { projectName: string; projectId: string; tasks: DeveloperTask[] }>();

    for (const task of tasks) {
      const key = task.projectId;
      if (!map.has(key)) {
        map.set(key, { projectName: task.projectName, projectId: task.projectId, tasks: [] });
      }
      map.get(key)!.tasks.push(task);
    }

    return Array.from(map.values());
  }

  onStatusChange(task: DeveloperTask, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = parseInt(select.value, 10);
    if (isNaN(newStatus)) return;

    this.updatingTaskId.set(task.id);
    this.taskService.updateTask(task.id, { status: newStatus as unknown as TaskStatus }).subscribe({
      next: () => {
        this.updatingTaskId.set(null);
        task.status = newStatus;
        const opt = this.statusOptions.find(o => o.value === newStatus);
        task.statusName = opt ? opt.label : 'Updated';
        this.toast.success('Task Status Updated', `"${task.title}" is now set to ${task.statusName}.`);
        this.updated.emit();
      },
      error: (err) => {
        this.updatingTaskId.set(null);
        this.toast.error('Update Failed', 'Failed to update task status.');
        console.error('Failed to update task status', err);
      }
    });
  }

  getStatusBadgeClass(status: number): string {
    const opt = this.statusOptions.find(o => o.value === status);
    return opt ? opt.badgeClass : 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: number): string {
    const opt = this.statusOptions.find(o => o.value === status);
    return opt ? opt.label : 'Todo';
  }

  getPriorityBadgeClass(priority: number | string): string {
    const p = String(priority).toLowerCase();
    if (p.includes('high') || p === '2') return 'bg-rose-100 text-rose-700';
    if (p.includes('med') || p === '1') return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  }
}
