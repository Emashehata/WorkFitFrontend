import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import {
  JiraSettingsResponse,
  UpsertJiraSettingsRequest,
  SyncResult,
} from '../../models/integration.models';
import { API_ROUTES } from '../../constants/api-routes.constant';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  getJiraSettings(orgId: string): Observable<JiraSettingsResponse> {
    return this.http.get<JiraSettingsResponse>(
      `${this.baseUrl}${API_ROUTES.integration.jiraSettings(orgId)}`,
    );
  }

  upsertJiraSettings(
    orgId: string,
    req: UpsertJiraSettingsRequest,
  ): Observable<JiraSettingsResponse> {
    return this.http.put<JiraSettingsResponse>(
      `${this.baseUrl}${API_ROUTES.integration.jiraSettings(orgId)}`,
      req,
    );
  }

  syncIntegration(orgId: string): Observable<SyncResult> {
    return this.http.post<SyncResult>(
      `${this.baseUrl}${API_ROUTES.integration.sync}`,
      { organizationId: orgId },
    );
  }
}
