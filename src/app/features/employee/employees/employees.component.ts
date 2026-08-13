import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task/task.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { EmployeeListItemDto } from '../../../core/models/task.models';
import { AddEmployeeModalComponent } from '../../../shared/components/add-employee-modal/add-employee-modal.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, AddEmployeeModalComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  employees = signal<EmployeeListItemDto[]>([]);
  isLoading = signal(true);
  showAddEmployeeModal = signal(false);

  isTeamLeader = this.authService.isTeamLeader;

  ngOnInit() {
    this.loadEmployees();
    this.route.queryParams.subscribe(params => {
      if (params['add'] === 'true' || params['create'] === 'true') {
        this.showAddEmployeeModal.set(true);
      }
    });
  }

  loadEmployees() {
    this.isLoading.set(true);
    this.taskService.getEmployees().subscribe({
      next: (emps) => {
        this.employees.set(emps);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.isLoading.set(false);
      }
    });
  }
}
