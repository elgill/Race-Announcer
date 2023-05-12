import { Component } from '@angular/core';
import { RunnerDataService } from '../services/runner-data.service';

@Component({
  selector: 'app-bib-entry',
  templateUrl: './bib-entry.component.html',
  styleUrls: ['./bib-entry.component.css']
})
export class BibEntryComponent {

  bibNumber: string = '';

  constructor(private runnerService: RunnerDataService) { }

  onSubmit(): void {
    this.runnerService.getRunnerByBib(this.bibNumber);
    this.bibNumber = '';
  }

}
