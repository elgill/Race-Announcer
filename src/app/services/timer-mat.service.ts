import { Injectable } from '@angular/core';
import { FileUpdateService } from './file-update.service';
import { RunnerDataService } from './runner-data.service'; // Assuming you have a service for managing runner data

@Injectable({
  providedIn: 'root'
})
export class TimerMatService {
  constructor(
    private fileUpdateService: FileUpdateService,
    private runnerDataService: RunnerDataService
  ) {
    this.fileUpdateService.getUpdates().subscribe(bibNumbers => {
      // @ts-ignore
      bibNumbers.forEach(bibNumber => {
        // Process each bib number here. For example, add the bib number to the runner data service.
        this.runnerDataService.enterBib(bibNumber);
      });
    });
  }
}

