import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssessmentsListComponent } from './my-assessments-list.component';

describe('MyAssessmentsListComponent', () => {
  let component: MyAssessmentsListComponent;
  let fixture: ComponentFixture<MyAssessmentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAssessmentsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAssessmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
