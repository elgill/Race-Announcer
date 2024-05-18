import { Injectable } from '@angular/core';
import { TimingBoxService } from './timing-box.service';
import { RunnerDataService } from './runner-data.service';

@Injectable({
  providedIn: 'root'
})
export class TimerMatService {
  constructor(
    private fileUpdateService: TimingBoxService,
    private runnerDataService: RunnerDataService
  ) {
    this.fileUpdateService.getUpdates().subscribe(bibNumbers => {
      bibNumbers.forEach((bibNumber: any) => this.runnerDataService.enterBib(bibNumber.toString()));
    });
  }
}

