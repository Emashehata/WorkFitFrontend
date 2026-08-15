import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { API_ROUTES } from '../../constants/api-routes.constant';
import {
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  CreateDeveloperInvitationRequest,
  InvitationDto,
  InvitationTokenInfo,
  ReviewInvitationResponse,
} from '../../models/invitation.models';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;

  requestInvitation(request: CreateDeveloperInvitationRequest): Observable<InvitationDto> {
    return this.http.post<InvitationDto>(
      `${this.baseUrl}${API_ROUTES.developerInvitations.create}`,
      request,
    );
  }

  getPendingInvitations(): Observable<InvitationDto[]> {
    return this.http.get<InvitationDto[]>(
      `${this.baseUrl}${API_ROUTES.developerInvitations.pending}`,
    );
  }

  reviewInvitation(id: string, approve: boolean): Observable<ReviewInvitationResponse> {
    return this.http.post<ReviewInvitationResponse>(
      `${this.baseUrl}${API_ROUTES.developerInvitations.review(id)}`,
      { approve },
    );
  }

  getTokenInfo(token: string): Observable<InvitationTokenInfo> {
    return this.http.get<InvitationTokenInfo>(
      `${this.baseUrl}${API_ROUTES.developerInvitations.token(token)}`,
    );
  }

  acceptInvitation(request: AcceptInvitationRequest): Observable<AcceptInvitationResponse> {
    return this.http.post<AcceptInvitationResponse>(
      `${this.baseUrl}${API_ROUTES.developerInvitations.accept}`,
      request,
    );
  }
}
