import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { TaskService } from '../../../../core/services/task/task.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { TaskDetailDto, EmployeeDetailsDto, EmployeeListItemDto, UpdateTaskRequest } from '../../../../core/models/task.models';
import { TaskStatus } from '../../../../core/enums/task-status.enum';
import { TaskPriority } from '../../../../core/enums/task-priority.enum';
import { BadgeVariant } from '../../../../core/models/badge.model';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [ModalComponent, BadgeComponent, ButtonComponent, DatePipe, ReactiveFormsModule],
  templateUrl: './task-detail-modal.component.html',
  styleUrl: './task-detail-modal.component.scss'
})
export class TaskDetailModalComponent {
  isOpen = input<boolean>(false);
  taskId = input<string>('');
  close = output<void>();

  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  task = signal<TaskDetailDto | null>(null);
  assignee = signal<EmployeeDetailsDto | null>(null);
  creator = signal<EmployeeDetailsDto | null>(null);
  employees = signal<EmployeeListItemDto[]>([]);
  employeeSearch = signal<string>('');

  filteredEmployees = computed(() => {
    const search = this.employeeSearch().trim().toLowerCase();
    if (!search) return this.employees();
    return this.employees().filter(e =>
      e.name.toLowerCase().includes(search) ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes(search)) ||
      (e.email && e.email.toLowerCase().includes(search))
    );
  });

  isLoading = signal(false);
  isSaving = signal(false);
  activeTab = signal<'details' | 'assign' | 'edit' | 'assignee' | 'creator'>('details');

  isTeamLeader = this.authService.isTeamLeader;
  isEmployee = this.authService.isEmployee;

  taskStatuses = Object.values(TaskStatus);
  priorities = Object.values(TaskPriority);

  assignForm = this.fb.nonNullable.group({
    assigneeId: ['', Validators.required],
    allocationPercentage: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [''],
    status: [TaskStatus.ToDo],
    priority: [TaskPriority.Medium],
    dueDate: [''],
    storyPoints: [null as number | null],
  });

  // Badge config for Priority
  priorityConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
    Low:      { variant: 'neutral', icon: 'fa-solid fa-arrow-down' },
    Medium:   { variant: 'info',    icon: 'fa-solid fa-minus' },
    High:     { variant: 'warning', icon: 'fa-solid fa-arrow-up' },
    Critical: { variant: 'danger',  icon: 'fa-solid fa-fire' },
  };

  // Badge config for Status
  statusConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
    ToDo:       { variant: 'neutral', icon: 'fa-solid fa-circle-dot' },
    InProgress: { variant: 'info',    icon: 'fa-solid fa-spinner animate-spin' },
    Review:     { variant: 'warning', icon: 'fa-solid fa-magnifying-glass' },
    Done:       { variant: 'success', icon: 'fa-solid fa-circle-check' },
  };

  constructor() {
    effect(() => {
      const id = this.taskId();
      const open = this.isOpen();
      if (id && open) {
        this.loadTaskDetails(id);
        this.loadEmployees();
      } else {
        this.resetState();
      }
    });
  }

  private resetState() {
    this.task.set(null);
    this.assignee.set(null);
    this.creator.set(null);
    this.activeTab.set('details');
    this.assignForm.reset({ assigneeId: '', allocationPercentage: 100 });
  }

  private loadTaskDetails(id: string) {
    this.isLoading.set(true);
    this.taskService.getTaskById(id).subscribe({
      next: (taskDetail) => {
        this.task.set(taskDetail);
        this.isLoading.set(false);
        this.patchEditForm(taskDetail);
        this.loadProfiles(taskDetail);
      },
      error: (err) => {
        console.error('Failed to load task details', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadProfiles(taskDetail: TaskDetailDto) {
    if (taskDetail.assigneeId) {
      this.taskService.getEmployeeById(taskDetail.assigneeId).subscribe({
        next: (profile) => this.assignee.set(profile),
        error: (err) => console.error('Failed to load assignee profile', err)
      });
    }

    if (taskDetail.createdById) {
      this.taskService.getEmployeeById(taskDetail.createdById).subscribe({
        next: (profile) => this.creator.set(profile),
        error: (err) => console.error('Failed to load creator profile', err)
      });
    }
  }

  private loadEmployees() {
    this.taskService.getEmployees().subscribe({
      next: (employees) => this.employees.set(employees),
      error: (err) => console.warn('Failed to load employees', err),
    });
  }

  private patchEditForm(task: TaskDetailDto) {
    this.editForm.setValue({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ?? '',
      storyPoints: task.storyPoints ?? null,
    });
  }

  onAssign() {
    const task = this.task();
    if (!task || this.assignForm.invalid || this.isSaving()) return;

    this.isSaving.set(true);

    const req = {
      projectId: task.projectId,
      assigneeId: this.assignForm.value.assigneeId!,
      allocationPercentage: this.assignForm.value.allocationPercentage ?? 100,
    };

    this.taskService.assignTask(task.id, req).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Success', 'Task assigned successfully');
        this.loadTaskDetails(task.id);
      },
      error: (err) => {
        this.isSaving.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to assign task';
        this.toast.error('Error', errorMsg);
        console.error('Failed to assign task', err);
      },
    });
  }

  onSaveEdit() {
    const task = this.task();
    if (!task || this.editForm.invalid || this.isSaving()) return;

    this.isSaving.set(true);
    const val = this.editForm.value;

    const req: UpdateTaskRequest = {
      title: val.title || undefined,
      description: val.description || undefined,
      status: val.status,
      priority: val.priority,
      dueDate: val.dueDate || undefined,
      storyPoints: val.storyPoints ?? undefined,
    };

    this.taskService.updateTask(task.id, req).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Success', 'Task updated successfully');
        this.loadTaskDetails(task.id);
      },
      error: (err) => {
        this.isSaving.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to update task';
        this.toast.error('Error', errorMsg);
        console.error('Failed to update task', err);
      },
    });
  }

  onComplete() {
    const task = this.task();
    if (!task || this.isSaving()) return;

    this.isSaving.set(true);
    this.taskService.completeTask(task.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toast.success('Success', 'Task completed');
        this.loadTaskDetails(task.id);
      },
      error: (err) => {
        this.isSaving.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to complete task';
        this.toast.error('Error', errorMsg);
        console.error('Failed to complete task', err);
      },
    });
  }

  getPriorityConfig(priority: string) {
    return this.priorityConfig[priority] ?? { variant: 'neutral' as BadgeVariant, icon: '' };
  }

  getStatusConfig(status: string) {
    return this.statusConfig[status] ?? { variant: 'neutral' as BadgeVariant, icon: '' };
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
}
