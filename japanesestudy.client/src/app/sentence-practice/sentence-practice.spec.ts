import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencePractice } from './sentence-practice';

describe('SentencePractice', () => {
  let component: SentencePractice;
  let fixture: ComponentFixture<SentencePractice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SentencePractice],
    }).compileComponents();

    fixture = TestBed.createComponent(SentencePractice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
