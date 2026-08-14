import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateTaskModalComponent } from './create-task-modal.component';

describe('CreateTaskModalComponent', () => {
  let component: CreateTaskModalComponent;
  let fixture: ComponentFixture<CreateTaskModalComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskModalComponent);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads only members of the selected project when opened', () => {
    const projectId = '9c72029a-42fb-4f53-a099-54ab2b6572a2';
    fixture.componentRef.setInput('projectId', projectId);
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const request = httpTesting.expectOne(request =>
      request.url.endsWith(`/api/projects/${projectId}/members`)
    );
    request.flush([{
      id: 'd9730f48-e774-4089-bf6b-eb738a246d2e',
      name: 'Project Developer',
      email: 'developer@example.com',
      jobTitle: 'Engineer',
      isActive: true,
      currentAllocationPercentage: 0,
    }]);

    expect(component.employees().map(employee => employee.name)).toEqual(['Project Developer']);
  });
});
