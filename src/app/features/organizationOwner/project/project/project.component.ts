import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Project, ProjectDetail } from '../../../../core/models/project.models';
import { ProjectService } from '../../../../core/services/project/project.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { BadgeComponent } from "../../../../shared/components/badge/badge.component";
import { ButtonComponent } from "../../../../shared/components/button/button/button.component";
import { DatePipe } from '@angular/common';
import { BadgeVariant } from '../../../../core/models/badge.model';
import { CreateProjectModalComponent } from '../create-project-modal/create-project-modal.component';
import { EditProjectModalComponent } from '../edit-project-modal/edit-project-modal.component';
import { JiraIntegrationModalComponent } from '../jira-integration-modal/jira-integration-modal.component';
import { PROJECT_STATUSES } from '../../../../core/models/project.models';
import { toApiProjectStatus } from '../../../../core/models/project.models';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-project',
  imports: [BadgeComponent, ButtonComponent, DatePipe, CreateProjectModalComponent, EditProjectModalComponent, JiraIntegrationModalComponent, ConfirmDialogComponent],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  projects = signal<Project[]>([]);
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showJiraModal = signal(false);
  selectedProject = signal<ProjectDetail | null>(null);
  selectedStatus = signal('');
  statusFilterOptions = PROJECT_STATUSES;
  isLoading = signal(false);
  searchTerm = signal('');
  sortBy = signal<'name' | 'startDate' | 'status'>('name');

  // ── Confirm dialog state ─────────────────────────────────
  showConfirm       = signal(false);
  confirmTitle      = signal('');
  confirmMessage    = signal('');
  confirmLabel      = signal('Confirm');
  confirmIcon       = signal('fa-solid fa-trash');
  confirmVariant    = signal<'danger' | 'primary' | 'secondary'>('danger');
  confirmHeaderIcon = signal('fa-solid fa-triangle-exclamation');
  private _pendingAction: (() => void) | null = null;

  statusConfig: Record<string, { variant: BadgeVariant; icon: string }> = {
    Planning:  { variant: 'warning', icon: 'fa-solid fa-hourglass-half' },
    Active:    { variant: 'success', icon: 'fa-solid fa-play' },
    Completed: { variant: 'info',    icon: 'fa-solid fa-circle-check' },
    OnHold:    { variant: 'neutral', icon: 'fa-solid fa-pause' },
    Cancelled: { variant: 'danger',  icon: 'fa-solid fa-circle-xmark' },
  };

  filteredProjects = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    const list = this.projects().filter(
      p => !q || p.name.toLowerCase().includes(q)
    );
    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'startDate':
          return (a.startDate ?? '').localeCompare(b.startDate ?? '');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  });

  hasActiveFilters = computed(() => !!this.searchTerm().trim() || !!this.selectedStatus());

  private projectService = inject(ProjectService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private organizationService = inject(OrganizationService);
  private toast = inject(ToastService);

  isTeamLeader = computed(() => this.authService.isTeamLeader() || this.authService.isOrganizationOwner());

  ngOnInit() {
    this.getProjects();
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.showCreateModal.set(true);
      }
    });
  }

  getProjects() {
    this.isLoading.set(true);
    // The API uses snake_case on the wire ("on_hold"); the UI keeps PascalCase.
    const status = this.selectedStatus() ? toApiProjectStatus(this.selectedStatus()) : undefined;
    const orgId = this.organizationService.organization()?.id;

    const request = this.authService.isTeamLeader()
      ? this.projectService.getProjectsForTeamLead(status)
      : this.projectService.getProjects(1, 100, status, orgId);

    request.subscribe({
      next: (res) => {
        this.projects.set(res);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.toast.error('Error', 'Failed to load projects');
      }
    });
  }

  onStatusFilterChange() {
    this.getProjects();
  }

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.onStatusFilterChange();
  }

  onSearchChange(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'name' | 'startDate' | 'status';
    this.sortBy.set(value);
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedStatus.set('');
    this.getProjects();
  }

  onView(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }

  onEdit(project: Project) {
    this.projectService.getProjectById(project.id).subscribe({
      next: (detail) => {
        this.selectedProject.set(detail);
        this.showEditModal.set(true);
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Error', 'Failed to load project details');
      }
    });
  }

  onProjectUpdated() {
    this.getProjects();
  }

  onArchive(project: Project) {
    this.confirmTitle.set('Archive Project?');
    this.confirmMessage.set(`"${project.name}" will be archived. This cannot be undone.`);
    this.confirmLabel.set('Archive');
    this.confirmIcon.set('fa-solid fa-box-archive');
    this.confirmVariant.set('danger');
    this.confirmHeaderIcon.set('fa-solid fa-box-archive');
    this._pendingAction = () => {
      this.projectService.archiveProject(project.id).subscribe({
        next: () => {
          this.toast.success('Success', 'Project archived successfully');
          this.projects.update(p => p.filter(x => x.id !== project.id));
        },
        error: (err) => {
          const errorMsg = err.error?.userFriendlyMessage || err.error?.errorMessage || err.error?.message || err.error?.title || 'Failed to archive project';
          this.toast.error('Error', errorMsg);
          console.error(err);
        }
      });
    };
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

  onProjectCreated() {
    this.getProjects();
  }

  getStatusConfig(status: string) {
  return this.statusConfig[status] ?? { variant: 'neutral' as BadgeVariant, icon: 'fa-solid fa-circle-question' };
}
}
