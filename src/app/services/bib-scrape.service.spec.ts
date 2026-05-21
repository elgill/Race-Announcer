import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BibScrapeService } from './bib-scrape.service';

describe('BibScrapeService', () => {
  let service: BibScrapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(BibScrapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
