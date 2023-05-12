import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BibEntryComponent } from './bib-entry.component';

describe('BibEntryComponent', () => {
  let component: BibEntryComponent;
  let fixture: ComponentFixture<BibEntryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BibEntryComponent]
    });
    fixture = TestBed.createComponent(BibEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
