import { TestBed } from '@angular/core/testing';

import { BibScrapeService } from './bib-scrape.service';

describe('BibScrapeService', () => {
  let service: BibScrapeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibScrapeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
