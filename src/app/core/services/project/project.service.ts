import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  Project,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectUpdatedDto,
  ProjectMember,
} from '../../models/project.models';
import { API_ROUTES } from '../../constants/api-routes.constant';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private http = inject(HttpClient);

  private baseUrl = environment.baseUrl;

  getProjects(
    page: number = 1,
    limit: number = 20,
    status?: string,
    organizationId?: string
  ): Observable<Project[]> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (status) {
      params = params.set('status', status);
    }

    if (organizationId) {
      params = params.set('organizationId', organizationId);
    }

    return this.http.get<Project[]>(`${this.baseUrl}${API_ROUTES.projects.list}`, { params });
  }

  getProjectsForTeamLead(status?: string): Observable<Project[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Project[]>(`${this.baseUrl}${API_ROUTES.projects.teamLead}`, { params });
  }

  getProjectById(id: string): Observable<ProjectDetail> {
    return this.http.get<ProjectDetail>(
      `${this.baseUrl}${API_ROUTES.projects.byId(id)}`
    );
  }

  createProject(req: CreateProjectRequest): Observable<string> {
    return this.http.post<string>(
      `${this.baseUrl}${API_ROUTES.projects.list}`,
      req
    );
  }

  updateProject(id: string, req: UpdateProjectRequest): Observable<ProjectUpdatedDto> {
    return this.http.put<ProjectUpdatedDto>(
      `${this.baseUrl}${API_ROUTES.projects.update(id)}`,
      req
    );
  }

  updateProjectStatus(id: string, status: string): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.projects.status(id)}`,
      { status }
    );
  }

  archiveProject(id: string): Observable<string> {
    return this.http.put<string>(
      `${this.baseUrl}${API_ROUTES.projects.archive(id)}`,
      {}
    );
  }

  getProjectMembers(projectId: string): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(
      `${this.baseUrl}${API_ROUTES.projects.members(projectId)}`
    );
  }

  addProjectMember(projectId: string, employeeId: string): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(
      `${this.baseUrl}${API_ROUTES.projects.members(projectId)}`,
      { employeeId }
    );
  }

}
