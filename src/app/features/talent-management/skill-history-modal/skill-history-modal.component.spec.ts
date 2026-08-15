import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillHistoryModalComponent } from './skill-history-modal.component';

describe('SkillHistoryModalComponent', () => {
  let component: SkillHistoryModalComponent;
  let fixture: ComponentFixture<SkillHistoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillHistoryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillHistoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
