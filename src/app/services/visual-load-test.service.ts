import { Injectable, inject } from '@angular/core';
import { RunnerDataService } from "./runner-data.service";
import {SettingsService} from "./settings.service";

@Injectable({
  providedIn: 'root'
})
export class VisualLoadTestService {
  private runnerDataService = inject(RunnerDataService);
  private settingsService = inject(SettingsService);

  private timeoutIds: NodeJS.Timeout[] = [];

  loadTestWithDelay(runners: { bib: string, timeElapsed: number }[], startFrom = 0) {
    this.stopLoadTest(); // Clear any existing timeouts

    const startMin = Math.floor(startFrom / (1000 * 60));
    const startSec = Math.floor(startFrom / (1000 * 60 * 60));
    console.log('Starting Load Test starting from', startMin, 'minutes and', startSec, 'seconds');

    const currentTime: Date = new Date(Date.now());
    const startTime: Date = new Date(currentTime.getTime() - startFrom);

    console.log('Race start time:', startTime.toISOString());
    this.settingsService.setRaceStartTime(startTime.toISOString())

    runners.forEach((runner) => {
      if (runner.timeElapsed >= startFrom) {
        const timeoutId = setTimeout(() => {
          this.runnerDataService.enterBib(runner.bib, false, false, 'automated');
        }, runner.timeElapsed - startFrom);
        this.timeoutIds.push(timeoutId);
      }
    });
  }

  stopLoadTest() {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
    console.log('Load Test halted')
  }
}
