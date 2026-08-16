import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteTaskReviewComponent } from './complete-task-review.component';

describe('CompleteTaskReviewComponent', () => {
  let component: CompleteTaskReviewComponent;
  let fixture: ComponentFixture<CompleteTaskReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteTaskReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteTaskReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
