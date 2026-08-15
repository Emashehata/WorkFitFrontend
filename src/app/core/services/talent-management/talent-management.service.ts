import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EmployeeProfile, EmployeeSkillDetail } from '../../models/talent-management.model';
import { API_ROUTES } from '../../constants/api-routes.constant';


@Injectable({ providedIn: 'root' })
export class TalentManagementService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  currentEmployee = signal<EmployeeProfile | null>(null);
  selectedSkill = signal<EmployeeSkillDetail | null>(null);
  loading = signal(false);

  getEmployeeById(id: string): Observable<EmployeeProfile> {
    this.loading.set(true);
    return this.http.get<EmployeeProfile>(`${this.baseUrl}${API_ROUTES.talent.employeeById(id)}`).pipe(
      tap((res) => this.currentEmployee.set(res)),
      finalize(() => this.loading.set(false))
    );
  }

  getEmployeeSkill(skillId: string, employeeId: string): Observable<EmployeeSkillDetail> {
    const params = new HttpParams().set('employeeId', employeeId);
    this.loading.set(true);
    return this.http
      .get<EmployeeSkillDetail>(`${this.baseUrl}/employee-skills/${skillId}`, { params })
      .pipe(
        tap((res) => this.selectedSkill.set(res)),
        finalize(() => this.loading.set(false))
      );
  }
}