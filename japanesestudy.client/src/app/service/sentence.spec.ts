import { TestBed } from '@angular/core/testing';

import { Sentence } from './sentence';

describe('Sentence', () => {
  let service: Sentence;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sentence);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
