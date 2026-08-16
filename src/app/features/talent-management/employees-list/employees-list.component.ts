import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { EmployeeListItem } from '../../../core/models/talent-management.model';
import { TalentManagementService } from '../../../core/services/talent-management/talent-management.service';
 

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [NgClass],
  templateUrl: './employees-list.component.html',
})
export class EmployeesListComponent implements OnInit {
  private talentService = inject(TalentManagementService);
  private router = inject(Router);

  employees = this.talentService.employeesList;
  loading = this.talentService.loading;

  searchTerm = signal('');

  filteredEmployees = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.employees();
    if (!term) return list;
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.jobTitle.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.talentService.getAllEmployees().subscribe();
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
  }

  viewDetails(employeeId: string) {
    this.router.navigate(['/employees', employeeId]);
  }

  trackByEmployee(index: number, employee: EmployeeListItem) {
    return employee.id;
  }
}