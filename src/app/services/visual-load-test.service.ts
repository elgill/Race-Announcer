import { Injectable } from '@angular/core';
import { RunnerDataService } from "./runner-data.service";

@Injectable({
  providedIn: 'root'
})
export class VisualLoadTestService {
  private timeoutIds: NodeJS.Timeout[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  loadTest() {
    this.runnerDataService.enterBib('101');
  }

  loadTestWithDelay(runners: { bib: string, timeElapsed: number }[], startFrom = 0) {
    this.stopLoadTest(); // Clear any existing timeouts

    runners.forEach((runner) => {
      if (runner.timeElapsed >= startFrom) {
        const timeoutId = setTimeout(() => {
          this.runnerDataService.enterBib(runner.bib);
        }, runner.timeElapsed - startFrom);
        this.timeoutIds.push(timeoutId);
      }
    });
  }

  stopLoadTest() {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
  }
}
