import { TestBed } from '@angular/core/testing';

import { RunnerHistoryService } from './runner-history.service';

describe('RunnerHistoryService', () => {
  let service: RunnerHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunnerHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
