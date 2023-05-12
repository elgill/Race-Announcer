import { TestBed } from '@angular/core/testing';

import { TimerMatService } from './timer-mat.service';

describe('TimerMatService', () => {
  let service: TimerMatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerMatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
