import { TestBed } from '@angular/core/testing';

import { TimingBoxService } from './timing-box.service';

describe('TimingBoxService', () => {
  let service: TimingBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimingBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
