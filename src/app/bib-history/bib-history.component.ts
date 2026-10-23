import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { FormsModule } from '@angular/forms';
import { RunnerDataService } from '../services/runner-data.service';
import { SettingsService, DEFAULT_SETTINGS } from '../services/settings.service';
import { EntryAttempt } from '../interfaces/entry-attempt';

@Component({
  selector: 'app-bib-history',
  templateUrl: './bib-history.component.html',
  styleUrls: ['./bib-history.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class BibHistoryComponent {
  private runnerDataService = inject(RunnerDataService);
  private settingsService = inject(SettingsService);

  searchBib: string = '';
  entryAttempts: EntryAttempt[] = [];
  hasSearched: boolean = false;
  private settings = toSignal(this.settingsService.getSettings(), { initialValue: DEFAULT_SETTINGS });
  private raceStartTime = computed(() => {
    const raceStartTime = this.settings().raceStartTime;
    return raceStartTime ? new Date(raceStartTime) : null;
  });

  onSearch(): void {
    if (!this.searchBib.trim()) {
      return;
    }

    this.entryAttempts = this.runnerDataService.getEntryAttempts(this.searchBib.trim());
    this.hasSearched = true;
  }

  clearSearch(): void {
    this.searchBib = '';
    this.entryAttempts = [];
    this.hasSearched = false;
  }

  getEntryTypeLabel(source: 'manual' | 'automated'): string {
    return source === 'manual' ? 'Manual' : 'Automated';
  }

  getShownLabel(wasShown: boolean): string {
    return wasShown ? 'Yes' : 'No (blocked)';
  }

  getShownCount(): number {
    return this.entryAttempts.filter(a => a.wasShown).length;
  }

  getBlockedCount(): number {
    return this.entryAttempts.filter(a => !a.wasShown).length;
  }

  formatPreciseTimestamp(timestamp: Date): string {
    const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
    const day = timestamp.getDate().toString().padStart(2, '0');
    const year = timestamp.getFullYear();
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    const milliseconds = timestamp.getMilliseconds().toString().padStart(3, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  getNetTime(timestamp: Date): string {
    const raceStartTime = this.raceStartTime();
    if (!raceStartTime) {
      return 'N/A (no race start time set)';
    }

    const netTimeMs = timestamp.getTime() - raceStartTime.getTime();

    if (netTimeMs < 0) {
      return 'N/A (before race start)';
    }

    const totalSeconds = Math.floor(netTimeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = netTimeMs % 1000;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
  }
}
