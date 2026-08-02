import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McQuiz } from './mc-quiz';

describe('McQuiz', () => {
  let component: McQuiz;
  let fixture: ComponentFixture<McQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [McQuiz],
    }).compileComponents();

    fixture = TestBed.createComponent(McQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
