import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BibScrapeUtilComponent } from './bib-scrape-util.component';

describe('BibScrapeUtilComponent', () => {
  let component: BibScrapeUtilComponent;
  let fixture: ComponentFixture<BibScrapeUtilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BibScrapeUtilComponent]
    });
    fixture = TestBed.createComponent(BibScrapeUtilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
