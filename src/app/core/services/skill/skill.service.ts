import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Skill } from '../../models/skill.models';
import { API_ROUTES } from '../../constants/api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}${API_ROUTES.skills.list}`);
  }
}
