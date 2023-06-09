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
      bibNumbers.forEach((bibNumber: any) => this.runnerDataService.enterBib(bibNumber.toString()));
    });
  }
}

