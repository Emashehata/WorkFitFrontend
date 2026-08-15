import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Assessment, AlterAssessmentRequest, ApproveRejectRequest } from '../../models/assessment.model';


@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}`;

  assessments = signal<Assessment[]>([]);
  selectedAssessment = signal<Assessment | null>(null);
  loading = signal(false);

  getById(id: string): Observable<Assessment> {
    this.loading.set(true);
    return this.http.get<Assessment>(`${this.baseUrl}/assessment/${id}`).pipe(
      tap((res) => this.selectedAssessment.set(res)),
      finalize(() => this.loading.set(false))
    );
  }

  getByEmployeeProfile(employeeProfileId: string): Observable<Assessment[]> {
    this.loading.set(true);
    return this.http
      .get<Assessment[]>(
        `${this.baseUrl}/assessment/employee-profile/${employeeProfileId}`
      )
      .pipe(
        tap((res) => this.assessments.set(res)),
        finalize(() => this.loading.set(false))
      );
  }

  getByTeamLead(teamLeadId: string): Observable<Assessment[]> {
    this.loading.set(true);
    return this.http
      .get<Assessment[]>(`${this.baseUrl}/assessment/teamlead/${teamLeadId}`)
      .pipe(
        tap((res) => this.assessments.set(res)),
        finalize(() => this.loading.set(false))
      );
  }

  alter(id: string, payload: AlterAssessmentRequest): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.baseUrl}/assessments/${id}/alter`,
      payload
    );
  }

  approve(id: string, payload: ApproveRejectRequest): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.baseUrl}/assessments/${id}/approve`,
      payload
    );
  }

  reject(id: string, payload: ApproveRejectRequest): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.baseUrl}/assessments/${id}/reject`,
      payload
    );
  }

  updateLocalStatus(id: string, status: 'Approved' | 'Rejected') {
    this.assessments.update((list) =>
      list.map((a) => (a.assessmentId === id ? { ...a, status } : a))
    );
  }

  clearSelected() {
    this.selectedAssessment.set(null);
  }
}