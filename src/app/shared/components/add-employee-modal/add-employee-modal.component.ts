import { Component, inject, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button/button.component';
import { TaskService } from '../../../core/services/task/task.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { EmployeeListItemDto } from '../../../core/models/task.models';
import { Project } from '../../../core/models/project.models';
import { ProjectService } from '../../../core/services/project/project.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { OrganizationService } from '../../../core/services/organization/organization.service';

@Component({
  selector: 'app-add-employee-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './add-employee-modal.component.html',
  styleUrl: './add-employee-modal.component.scss'
})
export class AddEmployeeModalComponent {
  isOpen = input<boolean>(false);
  close = output<void>();
  created = output<void>();

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  isLoadingEmployees = signal(false);
  isLoadingProjects = signal(false);
  isLoadingMembers = signal(false);

  allEmployees = signal<EmployeeListItemDto[]>([]);
  projects = signal<Project[]>([]);
  projectMemberIds = signal<Set<string>>(new Set());
  selectedProjectId = signal('');
  searchQuery = signal<string>('');
  isDropdownOpen = signal<boolean>(false);
  selectedEmployee = signal<EmployeeListItemDto | null>(null);

  filteredEmployees = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const memberIds = this.projectMemberIds();
    return this.allEmployees().filter(e =>
      !memberIds.has(e.id) &&
      (!q ||
        e.name.toLowerCase().includes(q) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.jobTitle && e.jobTitle.toLowerCase().includes(q)))
    );
  });

  form = this.fb.nonNullable.group({
    projectId: ['', [Validators.required]],
    employeeId: ['', [Validators.required]],
    email: [{ value: '', disabled: true }],
    jobTitle: [{ value: '', disabled: true }]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.loadOrganizationEmployees();
        this.loadProjects();
      }
    });
  }

  loadOrganizationEmployees() {
    this.isLoadingEmployees.set(true);
    this.taskService.getEmployees().subscribe({
      next: (emps) => {
        this.allEmployees.set(emps);
        this.isLoadingEmployees.set(false);
      },
      error: (err) => {
        console.error('Failed to load employees for dropdown', err);
        this.isLoadingEmployees.set(false);
      }
    });
  }

  private loadProjects() {
    this.isLoadingProjects.set(true);

    if (this.authService.isTeamLeader()) {
      this.projectService.getProjectsForTeamLead().subscribe({
        next: projects => this.setProjects(projects),
        error: err => this.handleProjectLoadError(err),
      });
      return;
    }

    const organization = this.organizationService.organization();
    if (organization) {
      this.loadOrganizationProjects(organization.id);
      return;
    }

    this.organizationService.getOrganization().subscribe({
      next: org => this.loadOrganizationProjects(org.id),
      error: err => this.handleProjectLoadError(err),
    });
  }

  private loadOrganizationProjects(organizationId: string) {
    this.projectService.getProjects(1, 100, undefined, organizationId).subscribe({
      next: projects => this.setProjects(projects),
      error: err => this.handleProjectLoadError(err),
    });
  }

  private setProjects(projects: Project[]) {
    this.projects.set(projects);
    this.isLoadingProjects.set(false);
  }

  private handleProjectLoadError(err: unknown) {
    console.error('Failed to load projects for employee assignment', err);
    this.projects.set([]);
    this.isLoadingProjects.set(false);
  }

  onProjectChange(event: Event) {
    const projectId = (event.target as HTMLSelectElement).value;
    this.selectedProjectId.set(projectId);
    this.clearSelection();
    this.searchQuery.set('');
    this.isDropdownOpen.set(false);
    this.projectMemberIds.set(new Set());

    if (!projectId) return;

    this.isLoadingMembers.set(true);
    this.projectService.getProjectMembers(projectId).subscribe({
      next: members => {
        this.projectMemberIds.set(new Set(members.map(member => member.id)));
        this.isLoadingMembers.set(false);
      },
      error: err => {
        console.error('Failed to load existing project members', err);
        this.isLoadingMembers.set(false);
      },
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.isDropdownOpen.set(true);

    if (this.selectedEmployee() && this.selectedEmployee()?.name !== value) {
      this.clearSelection();
    }
  }

  selectEmployee(emp: EmployeeListItemDto) {
    this.selectedEmployee.set(emp);
    this.searchQuery.set(emp.name);
    this.isDropdownOpen.set(false);

    this.form.patchValue({
      employeeId: emp.id,
      email: emp.email || '',
      jobTitle: emp.jobTitle || ''
    });

    this.form.controls.email.disable();
    this.form.controls.jobTitle.disable();
  }

  clearSelection() {
    this.selectedEmployee.set(null);
    this.form.patchValue({
      employeeId: '',
      email: '',
      jobTitle: ''
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.selectedEmployee() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const emp = this.selectedEmployee()!;
    const projectId = this.form.controls.projectId.value;
    const projectName = this.projects().find(project => project.id === projectId)?.name ?? 'project';

    this.projectService.addProjectMember(projectId, emp.id).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Success', `Employee "${emp.name}" assigned to ${projectName}`);
        this.created.emit();
        this.close.emit();
        this.resetForm();
      },
      error: err => {
        this.isSubmitting.set(false);
        const message = err.error?.userFriendlyMessage || err.error?.errorMessage || 'Failed to assign employee to project';
        this.toast.error('Error', message);
      },
    });
  }

  private resetForm() {
    this.form.reset({ projectId: '', employeeId: '', email: '', jobTitle: '' });
    this.selectedProjectId.set('');
    this.projectMemberIds.set(new Set());
    this.clearSelection();
    this.searchQuery.set('');
  }
}
