import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerbQuiz } from './verb-quiz';

describe('VerbQuiz', () => {
  let component: VerbQuiz;
  let fixture: ComponentFixture<VerbQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerbQuiz],
    }).compileComponents();

    fixture = TestBed.createComponent(VerbQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
