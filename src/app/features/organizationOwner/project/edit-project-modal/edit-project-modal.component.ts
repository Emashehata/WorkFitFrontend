import { Component, inject, input, output, signal, effect } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { ProjectService } from '../../../../core/services/project/project.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { ProjectDetail, UpdateProjectRequest } from '../../../../core/models/project.models';

@Component({
  selector: 'app-edit-project-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './edit-project-modal.component.html',
  styleUrl: './edit-project-modal.component.scss'
})
export class EditProjectModalComponent {
  isOpen = input<boolean>(false);
  project = input<ProjectDetail | null>(null);
  close = output<void>();
  saved = output<void>();

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [''],
    endDate: ['', this.endDateAfterStartDateValidator.bind(this)],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.resetForm(this.project());
      }
    });
  }

  private resetForm(project: ProjectDetail | null) {
    if (!project) {
      this.form.reset({ name: '', description: '', endDate: '' });
      return;
    }

    this.form.setValue({
      name: project.name ?? '',
      description: project.description ?? '',
      endDate: project.endDate ?? '',
    });
    this.form.controls.endDate.updateValueAndValidity();
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const project = this.project();
    if (!project) return;

    this.isSubmitting.set(true);

    const req: UpdateProjectRequest = {
      name: this.form.value.name || undefined,
      description: this.form.value.description || undefined,
      endDate: this.form.value.endDate || undefined,
    };

    this.projectService.updateProject(project.id, req).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Success', 'Project updated successfully');
        this.saved.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to update project';
        this.toast.error('Error', errorMsg);
        console.error('Failed to update project', err);
      }
    });
  }

  private endDateAfterStartDateValidator(control: AbstractControl) {
    const startDate = this.project()?.startDate;
    return startDate && control.value && control.value <= startDate
      ? { endDateBeforeStartDate: true }
      : null;
  }
}
