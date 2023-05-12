import { TestBed } from '@angular/core/testing';

import { RunnerDataService } from './runner-data.service';

describe('RunnerDataService', () => {
  let service: RunnerDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunnerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
