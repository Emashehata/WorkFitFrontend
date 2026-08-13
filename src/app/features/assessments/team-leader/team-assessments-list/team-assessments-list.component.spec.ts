import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamAssessmentsListComponent } from './team-assessments-list.component';

describe('TeamAssessmentsListComponent', () => {
  let component: TeamAssessmentsListComponent;
  let fixture: ComponentFixture<TeamAssessmentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamAssessmentsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamAssessmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
