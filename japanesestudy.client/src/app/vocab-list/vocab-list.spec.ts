import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabList } from './vocab-list';

describe('VocabList', () => {
  let component: VocabList;
  let fixture: ComponentFixture<VocabList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VocabList],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
