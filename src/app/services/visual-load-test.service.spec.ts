import { TestBed } from '@angular/core/testing';

import { VisualLoadTestService } from './visual-load-test.service';

describe('VisualLoadTestService', () => {
  let service: VisualLoadTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisualLoadTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
