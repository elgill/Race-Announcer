import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {RunnerDataService} from "../services/runner-data.service";

export interface XrefRange {
  startBib: string;
  endBib: string;
  startChip: string;
  endChip: string;
  count: number;
}

@Component({
    selector: 'app-show-xref',
    templateUrl: './show-xref.component.html',
    styleUrls: ['./show-xref.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FormsModule]
})
export class ShowXrefComponent {
  private runnerDataService = inject(RunnerDataService);

  xrefRanges: XrefRange[] = [];
  totalEntries = 0;
  searchBib = '';
  searchChip = '';
  private allEntries: { chipId: string, bib: string }[] = [];

  constructor() {
    // Fires on load and whenever XREF data is imported, created, or cleared
    this.runnerDataService.getXrefCount().pipe(takeUntilDestroyed()).subscribe(() => this.loadXrefData());
  }

  get isSearching(): boolean {
    return this.searchBib.trim() !== '' || this.searchChip.trim() !== '';
  }

  applySearch(): void {
    const bib = this.searchBib.trim();
    const chip = stripLeadingZeros(this.searchChip.trim());
    const matches = this.allEntries.filter(entry =>
      (!bib || entry.bib === bib) && (!chip || stripLeadingZeros(entry.chipId) === chip));
    this.xrefRanges = groupIntoRanges(matches);
  }

  clearSearch(): void {
    this.searchBib = '';
    this.searchChip = '';
    this.applySearch();
  }

  formatRange(start: string, end: string): string {
    return start === end ? start : `${start} – ${end}`;
  }

  private loadXrefData(): void {
    this.allEntries = Array.from(this.runnerDataService.getFullXrefMap().entries()).map(([chipId, bib]) => ({ chipId, bib }));
    this.totalEntries = this.allEntries.length;
    this.applySearch();
  }
}

/**
 * Collapses chip/bib pairs into ranges where both the bib and the chip increase by one
 * from entry to entry, e.g. bibs 1-500 on chips 000000000001-000000000500 become one row.
 */
export function groupIntoRanges(entries: { chipId: string, bib: string }[]): XrefRange[] {
  const sorted = [...entries].sort((a, b) => compareIds(a.bib, b.bib) || compareIds(a.chipId, b.chipId));
  const ranges: XrefRange[] = [];

  for (const entry of sorted) {
    const current = ranges[ranges.length - 1];
    if (current && isNext(current.endBib, entry.bib) && isNext(current.endChip, entry.chipId)) {
      current.endBib = entry.bib;
      current.endChip = entry.chipId;
      current.count++;
    } else {
      ranges.push({ startBib: entry.bib, endBib: entry.bib, startChip: entry.chipId, endChip: entry.chipId, count: 1 });
    }
  }

  return ranges;
}

const NUMERIC = /^\d+$/;

// Lets "123" match "000000000123"
function stripLeadingZeros(value: string): string {
  return value.replace(/^0+(?=.)/, '');
}

function compareIds(a: string, b: string): number {
  if (NUMERIC.test(a) && NUMERIC.test(b)) {
    const diff = BigInt(a) - BigInt(b);
    return diff === 0n ? 0 : diff < 0n ? -1 : 1;
  }
  return a.localeCompare(b, undefined, { numeric: true });
}

// True when `next` is exactly one more than `prev` and keeps the same formatting (e.g. zero padding)
function isNext(prev: string, next: string): boolean {
  if (!NUMERIC.test(prev) || !NUMERIC.test(next)) {
    return false;
  }
  const expected = (BigInt(prev) + 1n).toString();
  const padded = prev.length > expected.length ? expected.padStart(prev.length, '0') : expected;
  return next === padded;
}
