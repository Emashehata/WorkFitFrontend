import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  TaskListItem,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskDetailDto,
  EmployeeDetailsDto,
  EmployeeListItemDto,
  AssignTaskRequest,
  SetTaskAllocationRequest,
  SetTaskGitHubRequest,
} from '../../models/task.models';
import { API_ROUTES } from '../../constants/api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getProjectTasks(projectId: string): Observable<TaskListItem[]> {
    return this.http.get<TaskListItem[]>(
      `${this.baseUrl}${API_ROUTES.projects.tasks(projectId)}`,
    );
  }

  createTask(projectId: string, req: CreateTaskRequest): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.projects.tasks(projectId)}`,
      req,
    );
  }

  updateTask(taskId: string, req: UpdateTaskRequest): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.tasks.update(taskId)}`,
      req,
    );
  }

  completeTask(taskId: string): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.tasks.complete(taskId)}`,
      {},
    );
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${API_ROUTES.tasks.delete(taskId)}`,
    );
  }

  assignTask(taskId: string, req: AssignTaskRequest): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.tasks.assign(taskId)}`,
      req,
    );
  }

  setTaskAllocation(
    taskId: string,
    req: SetTaskAllocationRequest,
  ): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.tasks.allocation(taskId)}`,
      req,
    );
  }

  setTaskGitHub(taskId: string, req: SetTaskGitHubRequest): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.tasks.github(taskId)}`,
      req,
    );
  }

  getTaskById(taskId: string): Observable<TaskDetailDto> {
    return this.http.get<TaskDetailDto>(
      `${this.baseUrl}${API_ROUTES.tasks.byId(taskId)}`,
    );
  }

  getEmployees(): Observable<EmployeeListItemDto[]> {
    return this.http.get<EmployeeListItemDto[]>(
      `${this.baseUrl}${API_ROUTES.talent.employees}`,
    );
  }

  getEmployeeById(employeeId: string): Observable<EmployeeDetailsDto> {
    return this.http.get<EmployeeDetailsDto>(
      `${this.baseUrl}${API_ROUTES.talent.employeeById(employeeId)}`,
    );
  }

  onboardEmployee(req: { name: string; email: string; jobTitle: string; hireDate?: string }): Observable<{ employeeId: string }> {
    return this.http.post<{ employeeId: string }>(
      `${this.baseUrl}/api/employees`,
      req,
    );
  }
}
