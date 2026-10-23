import { TestBed } from '@angular/core/testing';

import { ReportingService } from './reporting.service';
import { RunnerDataService } from './services/runner-data.service';

describe('ReportingService', () => {
  let service: ReportingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('builds the timer report with a table of entered runners', () => {
    TestBed.inject(RunnerDataService).enterBib('12', true, true, 'manual');

    const doc = service.buildTimerReport();

    const pdf = doc.output();
    expect(pdf).toContain('(Timer Report)');
    expect(pdf).toContain('(First Name)');
    expect(pdf).toContain('(12)');
  });
});
