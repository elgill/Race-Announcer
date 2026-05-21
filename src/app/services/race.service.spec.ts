import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { RaceService } from './race.service';

describe('RaceService', () => {
  let service: RaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(RaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
