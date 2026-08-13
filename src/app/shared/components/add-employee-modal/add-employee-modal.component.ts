import { Component, inject, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { ButtonComponent } from '../button/button/button.component';
import { TaskService } from '../../../core/services/task/task.service';
import { ToastService } from '../../../core/services/toast/toast.service';
import { EmployeeListItemDto } from '../../../core/models/task.models';

@Component({
  selector: 'app-add-employee-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './add-employee-modal.component.html',
  styleUrl: './add-employee-modal.component.scss'
})
export class AddEmployeeModalComponent implements OnInit {
  isOpen = input<boolean>(false);
  close = output<void>();
  created = output<void>();

  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private toast = inject(ToastService);

  isSubmitting = signal(false);
  isLoadingEmployees = signal(false);

  allEmployees = signal<EmployeeListItemDto[]>([]);
  searchQuery = signal<string>('');
  isDropdownOpen = signal<boolean>(false);
  selectedEmployee = signal<EmployeeListItemDto | null>(null);

  filteredEmployees = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.allEmployees();
    return this.allEmployees().filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.email && e.email.toLowerCase().includes(q)) ||
      (e.jobTitle && e.jobTitle.toLowerCase().includes(q))
    );
  });

  form = this.fb.nonNullable.group({
    employeeId: ['', [Validators.required]],
    email: [{ value: '', disabled: true }],
    jobTitle: [{ value: '', disabled: true }]
  });

  ngOnInit() {
    this.loadOrganizationEmployees();
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

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toast.success('Success', `Employee "${emp.name}" assigned to team successfully`);
      this.created.emit();
      this.close.emit();
      this.clearSelection();
      this.searchQuery.set('');
    }, 300);
  }
}
