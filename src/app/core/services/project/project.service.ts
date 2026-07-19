import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Project } from '../../models/project.models';

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
    departmentId?: string
  ): Observable<Project[]> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (status) {
      params = params.set('status', status);
    }

    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }

    return this.http.get<Project[]>(
      `${this.baseUrl}/projects`,
      {
        params
      }
    );

  }

}