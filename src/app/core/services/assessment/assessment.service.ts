import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, finalize, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Assessment,
  AlterAssessmentRequest,
  ApproveRejectRequest,
} from '../../models/assessment.model';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  assessments = signal<Assessment[]>([]);
  selectedAssessment = signal<Assessment | null>(null);
  loading = signal(false);

  getById(id: string): Observable<Assessment> {
    return this.http
      .get<Assessment>(`${this.baseUrl}/assessment/${id}`)
      .pipe(tap((res) => this.selectedAssessment.set(res)));
  }

  // GET /api/assessment/employee — no params, JWT identifies the employee.
  // Returns a stub { assessmentId, employeeId, taskId, skillChanges } for
  // the employee's current assessment, NOT the full record.
  getCurrentEmployeeAssessmentStub(): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.baseUrl}/assessment/employee`);
  }

  // Full flow: stub -> full details by id. Sets `assessments` as a
  // single-item list so the existing list UI keeps working unchanged.
  getMyAssessments(): Observable<Assessment> {
    this.loading.set(true);
    return this.getCurrentEmployeeAssessmentStub().pipe(
      switchMap((stub) => this.getById(stub.assessmentId)),
      tap((full) => this.assessments.set([full])),
      finalize(() => this.loading.set(false)),
    );
  }

  // GET /api/assessment/teamlead — no params, JWT identifies the team lead.
  // Returns Assessment[] directly.
  getByTeamLead(): Observable<Assessment[]> {
    this.loading.set(true);
    return this.http
      .get<Assessment[]>(`${this.baseUrl}/assessment/teamlead`)
      .pipe(
        tap((res) => this.assessments.set(res)),
        finalize(() => this.loading.set(false)),
      );
  }

  alter(id: string, payload: AlterAssessmentRequest): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.baseUrl}/assessments/${id}/alter`,
      payload,
    );
  }

  approve(id: string, payload: ApproveRejectRequest): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.baseUrl}/assessments/${id}/approve`,
      payload,
    );
  }

  reject(id: string, payload: ApproveRejectRequest): Observable<Assessment> {
    return this.http.put<Assessment>(
      `${this.baseUrl}/assessments/${id}/reject`,
      payload,
    );
  }

  updateLocalStatus(id: string, status: 'Approved' | 'Rejected') {
    this.assessments.update((list) =>
      list.map((a) => (a.assessmentId === id ? { ...a, status } : a)),
    );
  }
}
