import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../../../core/services/project/project.service';
import { TaskService } from '../../../../core/services/task/task.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { ProjectDetail, normalizeProjectStatus, toApiProjectStatus } from '../../../../core/models/project.models';
import { TaskListItem, UpdateTaskRequest, EmployeeListItemDto } from '../../../../core/models/task.models';
import { TaskStatus } from '../../../../core/enums/task-status.enum';
import { TaskPriority } from '../../../../core/enums/task-priority.enum';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { BadgeVariant } from '../../../../core/models/badge.model';
import { CreateTaskModalComponent } from '../create-task-modal/create-task-modal.component';
import { TaskDetailModalComponent } from '../task-detail-modal/task-detail-modal.component';
import { EditProjectModalComponent } from '../edit-project-modal/edit-project-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    DatePipe,
    BadgeComponent,
    ButtonComponent,
    CreateTaskModalComponent,
    TaskDetailModalComponent,
    EditProjectModalComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  project = signal<ProjectDetail | null>(null);
  projectId = signal<string>('');
  allTasks = signal<TaskListItem[]>([]);
  employees = signal<EmployeeListItemDto[]>([]);
  isLoading = signal(true);
  isChangingStatus = signal(false);
  showCreateTaskModal = signal(false);
  showTaskDetailModal = signal(false);
  showEditProjectModal = signal(false);
  selectedTaskId = signal<string>('');
  employeeSearch = signal<string>('');

  filteredEmployees = computed(() => {
    const search = this.employeeSearch().trim().toLowerCase();
    if (!search) return this.employees();
    return this.employees().filter((e: EmployeeListItemDto) =>
      e.name.toLowerCase().includes(search) ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes(search)) ||
      (e.email && e.email.toLowerCase().includes(search))
    );
  });

  // ── Confirm dialog state ───────────────────────────────────
  showConfirm       = signal(false);
  confirmTitle      = signal('');
  confirmMessage    = signal('');
  confirmLabel      = signal('Confirm');
  confirmIcon       = signal('fa-solid fa-trash');
  confirmVariant    = signal<'danger' | 'primary' | 'secondary'>('danger');
  confirmHeaderIcon = signal('fa-solid fa-triangle-exclamation');
  private _pendingAction: (() => void) | null = null;

  isTeamLeader = computed(() => this.authService.isTeamLeader() || this.authService.isOrganizationOwner());
  isEmployee = this.authService.isEmployee;

  employeeMap = computed(() => {
    const map = new Map<string, string>();
    for (const e of this.employees()) {
      map.set(e.id, e.name);
    }
    return map;
  });

  assignedEmployeeIds = computed(() =>
    [...new Set(this.allTasks().map(task => task.assigneeId).filter((id): id is string => !!id))]
  );

  completedTaskCount = computed(() =>
    this.allTasks().filter(task => task.status === TaskStatus.Done).length
  );

  // Kanban columns
  columns: { status: TaskStatus; label: string; icon: string; colorClass: string }[] = [
    { status: TaskStatus.ToDo,       label: 'To Do',       icon: 'fa-solid fa-circle-dot',      colorClass: 'column-todo' },
    { status: TaskStatus.InProgress, label: 'In Progress', icon: 'fa-solid fa-spinner',          colorClass: 'column-inprogress' },
    { status: TaskStatus.Review,     label: 'Review',      icon: 'fa-solid fa-magnifying-glass', colorClass: 'column-review' },
    { status: TaskStatus.Done,       label: 'Done',        icon: 'fa-solid fa-circle-check',     colorClass: 'column-done' },
  ];

  columnIds = this.columns.map(c => `column-${c.status}`);

  // Project status badge config
  projectStatusConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
    Planning:  { variant: 'warning', icon: 'fa-solid fa-hourglass-half' },
    Active:    { variant: 'success', icon: 'fa-solid fa-play' },
    Completed: { variant: 'info',    icon: 'fa-solid fa-circle-check' },
    OnHold:    { variant: 'neutral', icon: 'fa-solid fa-pause' },
    Cancelled: { variant: 'danger',  icon: 'fa-solid fa-circle-xmark' },
  };

  // Task priority config
  priorityConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
    Low:      { variant: 'neutral', icon: 'fa-solid fa-arrow-down' },
    Medium:   { variant: 'info',    icon: 'fa-solid fa-minus' },
    High:     { variant: 'warning', icon: 'fa-solid fa-arrow-up' },
    Critical: { variant: 'danger',  icon: 'fa-solid fa-fire' },
  };

  // Task type icons
  taskTypeIcons: Record<string, string> = {
    Story:   'fa-solid fa-book-open',
    Bug:     'fa-solid fa-bug',
    Epic:    'fa-solid fa-bolt',
    Task:    'fa-solid fa-check-square',
    SubTask: 'fa-solid fa-code-branch',
  };

  // Allowed project status transitions (mirrors backend state machine)
  private transitions: Record<string, string[]> = {
    Planning:  ['Active', 'Cancelled'],
    Active:    ['OnHold', 'Completed', 'Cancelled'],
    OnHold:    ['Active', 'Cancelled'],
    Completed: [],
    Cancelled: [],
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectId.set(id);
      this.loadProject(id);
      this.loadTasks(id);
      this.loadEmployees();
    }
  }

  loadProject(id: string) {
    this.projectService.getProjectById(id).subscribe({
      next: (project) => {
        this.project.set(project);
      },
      error: (err) => console.error('Failed to load project', err),
    });
  }

  loadTasks(id: string) {
    this.isLoading.set(true);
    this.taskService.getProjectTasks(id).subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.isLoading.set(false);
      },
    });
  }

  loadEmployees() {
    this.projectService.getProjectMembers(this.projectId()).subscribe({
      next: (employees) => this.employees.set(employees.map(employee => ({
        ...employee,
        email: employee.email ?? '',
      }))),
      error: (err) => console.warn('Failed to load employees', err),
    });
  }

  getTasksByStatus(status: TaskStatus): TaskListItem[] {
    return this.allTasks().filter(t => t.status === status);
  }

  getColumnId(status: TaskStatus): string {
    return `column-${status}`;
  }

  getNormalizedStatus(status: string): string {
    return normalizeProjectStatus(status);
  }

  getProjectStatusConfig(status: string) {
    const normalized = normalizeProjectStatus(status);
    return this.projectStatusConfig[normalized] ?? { variant: 'neutral' as BadgeVariant, icon: 'fa-solid fa-circle-question' };
  }

  getPriorityConfig(priority: string) {
    return this.priorityConfig[priority] ?? { variant: 'neutral' as BadgeVariant, icon: '' };
  }

  getTaskTypeIcon(taskType: string): string {
    return this.taskTypeIcons[taskType] ?? 'fa-solid fa-circle';
  }

  getAssigneeName(task: TaskListItem): string {
    return task.assigneeId ? (this.employeeMap().get(task.assigneeId) ?? 'Unassigned') : 'Unassigned';
  }

  getCreatorName(task: TaskListItem): string {
    return task.createdById ? (this.employeeMap().get(task.createdById) ?? 'System') : 'System';
  }

  getInitials(employeeId: string): string {
    const name = this.employeeMap().get(employeeId) ?? 'Unknown';
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  getSourceLabel(sourceSystem: string | null): string {
    return sourceSystem ? sourceSystem.replace(/([a-z])([A-Z])/g, '$1 $2') : 'Internal';
  }

  allowedNextStatuses(): string[] {
    const normalized = normalizeProjectStatus(this.project()?.status ?? '');
    return this.transitions[normalized] ?? [];
  }

  onStatusSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const next = target.value;
    target.value = '';
    this.onChangeStatus(next);
  }

  onChangeStatus(next: string) {
    const project = this.project();
    if (!project || this.isChangingStatus()) return;

    this.isChangingStatus.set(true);
    this.projectService.updateProjectStatus(project.id, toApiProjectStatus(next)).subscribe({
      next: () => {
        this.isChangingStatus.set(false);
        this.toast.success('Success', `Project moved to ${next}`);
        this.loadProject(project.id);
      },
      error: (err) => {
        this.isChangingStatus.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to change project status';
        this.toast.error('Error', errorMsg);
        console.error('Failed to change project status', err);
      },
    });
  }

  onArchive() {
    const project = this.project();
    if (!project) return;

    this.openConfirm({
      title: 'Archive Project?',
      message: `"${project.name}" will be archived. This cannot be undone.`,
      confirmLabel: 'Archive',
      confirmIcon: 'fa-solid fa-box-archive',
      confirmVariant: 'danger',
      headerIcon: 'fa-solid fa-box-archive',
      action: () => {
        this.projectService.archiveProject(project.id).subscribe({
          next: () => {
            this.toast.success('Success', 'Project archived');
            this.router.navigate(['/projects']);
          },
          error: (err) => {
            const errorMsg = err.error?.userFriendlyMessage || err.error?.errorMessage || err.error?.message || err.error?.title || 'Failed to archive project';
            this.toast.error('Error', errorMsg);
            console.error('Failed to archive project', err);
          },
        });
      },
    });
  }

  onEditProject() {
    this.showEditProjectModal.set(true);
  }

  onProjectUpdated() {
    const proj = this.project();
    if (proj) this.loadProject(proj.id);
  }

  onDrop(event: CdkDragDrop<TaskListItem[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id.replace('column-', '') as TaskStatus;

      // Prevent dragging out of Done
      if (task.status === TaskStatus.Done) {
        return;
      }

      // Optimistic UI update
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      const oldStatus = task.status;
      task.status = newStatus;

      // Call API
      const updateReq: UpdateTaskRequest = { status: newStatus };
      this.taskService.updateTask(task.id, updateReq).subscribe({
        error: (err) => {
          // Revert on error
          console.error('Failed to update task status', err);
          task.status = oldStatus;
          this.reloadTasks();
        },
      });
    }
  }

  onCompleteTask(task: TaskListItem) {
    const oldStatus = task.status;
    task.status = TaskStatus.Done;

    this.taskService.completeTask(task.id).subscribe({
      next: () => {
        this.reloadTasks();
      },
      error: (err) => {
        console.error('Failed to complete task', err);
        task.status = oldStatus;
        this.reloadTasks();
      },
    });
  }

  onDeleteTask(task: TaskListItem) {
    this.openConfirm({
      title: 'Delete Task?',
      message: `"${task.title}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      confirmIcon: 'fa-solid fa-trash',
      confirmVariant: 'danger',
      headerIcon: 'fa-solid fa-triangle-exclamation',
      action: () => {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => this.reloadTasks(),
          error: (err) => console.error('Failed to delete task', err),
        });
      },
    });
  }

  onTaskCreated() {
    this.reloadTasks();
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  // ── Confirm Dialog helpers ────────────────────────────────
  private openConfirm(opts: {
    title: string;
    message: string;
    confirmLabel: string;
    confirmIcon: string;
    confirmVariant: 'danger' | 'primary' | 'secondary';
    headerIcon: string;
    action: () => void;
  }) {
    this.confirmTitle.set(opts.title);
    this.confirmMessage.set(opts.message);
    this.confirmLabel.set(opts.confirmLabel);
    this.confirmIcon.set(opts.confirmIcon);
    this.confirmVariant.set(opts.confirmVariant);
    this.confirmHeaderIcon.set(opts.headerIcon);
    this._pendingAction = opts.action;
    this.showConfirm.set(true);
  }

  onConfirmed() {
    this.showConfirm.set(false);
    this._pendingAction?.();
    this._pendingAction = null;
  }

  onCancelled() {
    this.showConfirm.set(false);
    this._pendingAction = null;
  }

  private reloadTasks() {
    const proj = this.project();
    if (proj) {
      this.loadTasks(proj.id);
    }
  }

  onViewTask(task: TaskListItem) {
    this.selectedTaskId.set(task.id);
    this.showTaskDetailModal.set(true);
  }

  canDrag(task: TaskListItem): boolean {
    // Only TeamLeader can drag, and Done tasks can't be moved
    return this.isTeamLeader() && task.status !== TaskStatus.Done;
  }
}
