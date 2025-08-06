import { TestBed } from '@angular/core/testing';

import { DateRange } from './date-range.service';

describe('DateRange', () => {
  let service: DateRange;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateRange);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
