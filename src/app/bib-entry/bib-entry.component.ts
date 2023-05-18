import {Component, HostListener} from '@angular/core';
import { RunnerDataService } from '../services/runner-data.service';

@Component({
  selector: 'app-bib-entry',
  templateUrl: './bib-entry.component.html',
  styleUrls: ['./bib-entry.component.css']
})
export class BibEntryComponent {

  bibNumber: string = '';

  constructor(private runnerDataService: RunnerDataService) { }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {  // replace 'Backspace' with your preferred key
      this.onRemoveLastRunnerClick();
    }
  }

  onRemoveLastRunnerClick() {
    this.runnerDataService.removeLastRunner();
  }

  onSubmit(): void {
    this.runnerDataService.enterBib(this.bibNumber);
    this.bibNumber = '';
  }

}
