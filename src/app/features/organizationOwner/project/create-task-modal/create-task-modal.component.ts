import { Component, inject, input, output, signal, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { TaskService } from '../../../../core/services/task/task.service';
import { TaskType } from '../../../../core/enums/task-type.enum';
import { TaskPriority } from '../../../../core/enums/task-priority.enum';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { EmployeeListItemDto } from '../../../../core/models/task.models';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.scss'
})
export class CreateTaskModalComponent implements OnInit {
  isOpen = input<boolean>(false);
  projectId = input<string>('');
  close = output<void>();
  created = output<void>();

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  isLoadingEmployees = signal(false);
  employees = signal<EmployeeListItemDto[]>([]);

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

  ngOnInit() {
    // Initial load in case the modal starts open or effect hasn't fired yet.
    if (this.employees().length === 0) {
      this.loadEmployees();
    }
  }

  private loadEmployees() {
    this.isLoadingEmployees.set(true);
    this.form.controls.assigneeId.disable({ emitEvent: false });
    this.taskService.getEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
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

  onSubmit() {
    let targetProjectId = this.projectId();
    if (!targetProjectId) {
      const match = window.location.pathname.match(/\/projects\/([a-f0-9-]{36})/i);
      if (match && match[1]) {
        targetProjectId = match[1];
      }
    }

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
        const errorMsg = err.error?.message || err.error?.title || 'Failed to create task';
        this.toast.error('Error', errorMsg);
        console.error('Failed to create task', err);
      }
    });
  }
}
