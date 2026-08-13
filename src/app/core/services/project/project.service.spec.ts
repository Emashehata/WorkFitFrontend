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
});
