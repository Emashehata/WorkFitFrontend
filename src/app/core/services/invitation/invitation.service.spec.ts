import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { InvitationService } from './invitation.service';

describe('InvitationService', () => {
  let service: InvitationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvitationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the developer invitation API routes', () => {
    const createBody = { projectId: 'p1', employeeProfileId: 'e1', sourceAccountId: 'jira-1', email: 'dev@example.com' };
    service.requestInvitation(createBody).subscribe();
    const create = http.expectOne(`${environment.baseUrl}/developer-invitations`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(createBody);
    create.flush({});

    service.getPendingInvitations().subscribe();
    const pending = http.expectOne(`${environment.baseUrl}/developer-invitations/pending`);
    expect(pending.request.method).toBe('GET');
    pending.flush([]);

    service.reviewInvitation('inv-1', true).subscribe();
    const review = http.expectOne(`${environment.baseUrl}/developer-invitations/inv-1/review`);
    expect(review.request.method).toBe('POST');
    expect(review.request.body).toEqual({ approve: true });
    review.flush({});

    service.getTokenInfo('token/value').subscribe();
    const token = http.expectOne(`${environment.baseUrl}/developer-invitations/token/token%2Fvalue`);
    expect(token.request.method).toBe('GET');
    token.flush({});

    const acceptBody = { token: 'token', displayName: 'Developer', password: 'Password1!' };
    service.acceptInvitation(acceptBody).subscribe();
    const accept = http.expectOne(`${environment.baseUrl}/developer-invitations/accept`);
    expect(accept.request.method).toBe('POST');
    expect(accept.request.body).toEqual(acceptBody);
    accept.flush({});
  });
});
