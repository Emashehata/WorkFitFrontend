import { Component, inject, input, output, signal, OnInit, effect } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button/button.component';
import { ProjectService } from '../../../../core/services/project/project.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { SkillService } from '../../../../core/services/skill/skill.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Skill } from '../../../../core/models/skill.models';

@Component({
  selector: 'app-create-project-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './create-project-modal.component.html',
  styleUrl: './create-project-modal.component.scss'
})
export class CreateProjectModalComponent implements OnInit {
  isOpen = input<boolean>(false);
  close = output<void>();
  created = output<void>();

  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private skillService = inject(SkillService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  isLoadingSkills = signal(false);
  skills = signal<Skill[]>([]);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    requiredSkills: this.fb.array([]),
  }, { validators: CreateProjectModalComponent.dateRangeValidator });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadSkills();
      }
    });
  }

  get requiredSkills(): FormArray {
    return this.form.controls.requiredSkills;
  }

  addRequiredSkill() {
    this.requiredSkills.push(this.fb.nonNullable.group({
      skillId: ['', [Validators.required]],
      level: ['Proficient'],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
    }));
  }

  removeRequiredSkill(index: number) {
    this.requiredSkills.removeAt(index);
  }

  ngOnInit() {
    if (!this.organizationService.organization()) {
      this.organizationService.getOrganization().subscribe({
        error: (err) => console.error('Failed to load organization', err)
      });
    }
    this.loadSkills();
  }

  private loadSkills() {
    if (this.isLoadingSkills() || this.skills().length > 0) return;
    this.isLoadingSkills.set(true);
    this.skillService.getSkills().subscribe({
      next: (skills) => {
        this.skills.set(skills);
        this.isLoadingSkills.set(false);
      },
      error: (err) => {
        console.warn('Failed to load skills', err);
        this.isLoadingSkills.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const currentUser = this.authService.currentUser();
    const org = this.organizationService.organization();
    const orgId = currentUser?.orgId || org?.id || '';

    const req = {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
      attatchedDocumentIds: [],
      orgnaizationId: orgId,
      teamLeaderId: currentUser?.userId || '',
      startDate: this.form.value.startDate!,
      endDate: this.form.value.endDate!,
      requiredSkills: this.requiredSkills.getRawValue(),
    };

    this.projectService.createProject(req).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.form.reset();
        this.requiredSkills.clear();
        this.toast.success('Success', 'Project created successfully');
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const errorMsg = err.error?.message || err.error?.title || 'Failed to create project';
        this.toast.error('Error', errorMsg);
        console.error('Failed to create project', err);
      }
    });
  }

  private static dateRangeValidator(control: import('@angular/forms').AbstractControl) {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    return startDate && endDate && endDate <= startDate ? { endDateBeforeStartDate: true } : null;
  }
}
