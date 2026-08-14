import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { ProjectService } from './project.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProjectService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends an optional status filter for team-lead projects', () => {
    service.getProjectsForTeamLead('on_hold').subscribe();

    const request = httpTesting.expectOne(request =>
      request.url.endsWith('/api/projects/teamLead') && request.params.get('status') === 'on_hold'
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('gets members for the selected project', () => {
    const projectId = '9c72029a-42fb-4f53-a099-54ab2b6572a2';

    service.getProjectMembers(projectId).subscribe();

    const request = httpTesting.expectOne(request =>
      request.url.endsWith(`/api/projects/${projectId}/members`)
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('adds an employee to the selected project', () => {
    const projectId = '9c72029a-42fb-4f53-a099-54ab2b6572a2';
    const employeeId = 'd9730f48-e774-4089-bf6b-eb738a246d2e';

    service.addProjectMember(projectId, employeeId).subscribe();

    const request = httpTesting.expectOne(request =>
      request.url.endsWith(`/api/projects/${projectId}/members`)
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ employeeId });
    request.flush({
      id: employeeId,
      name: 'Developer',
      email: 'developer@example.com',
      jobTitle: 'Engineer',
      isActive: true,
      currentAllocationPercentage: 0,
    });
  });
});
