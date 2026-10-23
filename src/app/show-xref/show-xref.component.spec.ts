import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowXrefComponent, groupIntoRanges } from './show-xref.component';

describe('groupIntoRanges', () => {
  it('collapses consecutive bib/chip pairs into one range', () => {
    const ranges = groupIntoRanges([
      { bib: '3', chipId: '000000000103' },
      { bib: '1', chipId: '000000000101' },
      { bib: '2', chipId: '000000000102' },
    ]);
    expect(ranges).toEqual([
      { startBib: '1', endBib: '3', startChip: '000000000101', endChip: '000000000103', count: 3 },
    ]);
  });

  it('breaks ranges when bibs or chips are non-consecutive', () => {
    const ranges = groupIntoRanges([
      { bib: '1', chipId: '100' },
      { bib: '2', chipId: '101' },
      { bib: '4', chipId: '102' },
      { bib: '5', chipId: '200' },
    ]);
    expect(ranges.map(r => [r.startBib, r.endBib, r.count])).toEqual([['1', '2', 2], ['4', '4', 1], ['5', '5', 1]]);
  });

  it('keeps non-numeric chips as single entries', () => {
    const ranges = groupIntoRanges([
      { bib: '1', chipId: 'ABC1' },
      { bib: '2', chipId: 'ABC2' },
    ]);
    expect(ranges.length).toBe(2);
  });
});

describe('ShowXrefComponent', () => {
  let component: ShowXrefComponent;
  let fixture: ComponentFixture<ShowXrefComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ShowXrefComponent]
    });
    fixture = TestBed.createComponent(ShowXrefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('search', () => {
    beforeEach(() => {
      component['allEntries'] = [
        { bib: '1', chipId: '000000000101' },
        { bib: '2', chipId: '000000000102' },
        { bib: '3', chipId: '000000000103' },
      ];
    });

    it('finds an exact bib', () => {
      component.searchBib = '2';
      component.applySearch();
      expect(component.xrefRanges().map(r => r.startChip)).toEqual(['000000000102']);
    });

    it('finds a chip code without its leading zeros', () => {
      component.searchChip = '103';
      component.applySearch();
      expect(component.xrefRanges().map(r => r.startBib)).toEqual(['3']);
    });

    it('shows all ranges again after clearing', () => {
      component.searchBib = '2';
      component.applySearch();
      component.clearSearch();
      expect(component.xrefRanges().length).toBe(1);
      expect(component.xrefRanges()[0].count).toBe(3);
    });
  });
});
