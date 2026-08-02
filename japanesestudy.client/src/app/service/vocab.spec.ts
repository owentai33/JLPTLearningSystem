import { TestBed } from '@angular/core/testing';

import { VocabService } from './vocab';

describe('VocabService', () => {
  let service: VocabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VocabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
