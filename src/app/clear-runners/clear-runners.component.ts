import { Component } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";

@Component({
  selector: 'app-clear-runners',
  templateUrl: './clear-runners.component.html',
  styleUrls: ['./clear-runners.component.css']
})
export class ClearRunnersComponent {
  clearStatus = '';

  constructor(private runnerDataService: RunnerDataService) { }

  clearRunners() {
    this.runnerDataService.clearAllRunners();
    this.clearStatus = 'Runners Cleared!';

    setTimeout(() => {
      this.clearStatus = '';
    }, 3000);
  }

  clearXref() {
    this.runnerDataService.clearXref();
    this.clearStatus = 'XREF Cleared!';

    setTimeout(() => {
      this.clearStatus = '';
    }, 3000);
  }
}
