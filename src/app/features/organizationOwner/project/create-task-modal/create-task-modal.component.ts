import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { TaskService } from '../../../../core/services/task/task.service';
import { TaskType } from '../../../../core/enums/task-type.enum';
import { TaskPriority } from '../../../../core/enums/task-priority.enum';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { EmployeeListItemDto } from '../../../../core/models/task.models';
import { ProjectService } from '../../../../core/services/project/project.service';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.scss'
})
export class CreateTaskModalComponent {
  isOpen = input<boolean>(false);
  projectId = input<string>('');
  close = output<void>();
  created = output<void>();

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  isLoadingEmployees = signal(false);
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

  taskTypes = Object.values(TaskType);
  priorities = Object.values(TaskPriority);

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [''],
    taskType: [TaskType.Task],
    priority: [TaskPriority.Medium],
    assigneeId: [''],
    storyPoints: [null as number | null],
    dueDate: [''],
    allocationPercentage: [100, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  constructor() {
    // Reload employee list every time the modal is opened so the dropdown is always fresh.
    effect(() => {
      if (this.isOpen()) {
        this.loadEmployees();
      }
    });
  }

  private loadEmployees() {
    const projectId = this.resolveProjectId();
    this.employees.set([]);
    this.form.controls.assigneeId.setValue('', { emitEvent: false });

    if (!projectId) {
      this.form.controls.assigneeId.disable({ emitEvent: false });
      return;
    }

    this.isLoadingEmployees.set(true);
    this.form.controls.assigneeId.disable({ emitEvent: false });
    this.projectService.getProjectMembers(projectId).subscribe({
      next: (employees) => {
        this.employees.set(employees
          .filter(employee => employee.isActive)
          .map(employee => ({
            ...employee,
            email: employee.email ?? '',
          })));
        this.isLoadingEmployees.set(false);
        this.form.controls.assigneeId.enable({ emitEvent: false });
      },
      error: (err) => {
        console.warn('Failed to load employees', err);
        this.isLoadingEmployees.set(false);
        this.form.controls.assigneeId.enable({ emitEvent: false });
      },
    });
  }

  private resolveProjectId(): string {
    const inputProjectId = this.projectId();
    if (inputProjectId) return inputProjectId;

    return window.location.pathname.match(/\/projects\/([a-f0-9-]{36})/i)?.[1] ?? '';
  }

  onSubmit() {
    if (this.isSubmitting() || this.form.invalid) return;

    const targetProjectId = this.resolveProjectId();

    if (!targetProjectId) {
      this.toast.error('Error', 'Project ID is missing. Please reload the project page.');
      return;
    }

    this.isSubmitting.set(true);

    const val = this.form.value;

    const req = {
      title: val.title!,
      description: val.description || undefined,
      taskType: val.taskType,
      priority: val.priority,
      assigneeId: val.assigneeId || undefined,
      storyPoints: val.storyPoints || undefined,
      dueDate: val.dueDate || undefined,
      allocationPercentage: val.allocationPercentage ?? 100,
    };

    this.taskService.createTask(targetProjectId, req).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset({
          title: '',
          description: '',
          taskType: TaskType.Task,
          priority: TaskPriority.Medium,
          assigneeId: '',
          storyPoints: null,
          dueDate: '',
          allocationPercentage: 100,
        });
        this.toast.success('Success', 'Task created successfully');
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err.error?.userFriendlyMessage || err.error?.errorMessage || err.error?.message || err.error?.title || 'Failed to create task';
        this.toast.error('Error', errorMsg);
        console.error('Failed to create task', err);
      }
    });
  }
}
