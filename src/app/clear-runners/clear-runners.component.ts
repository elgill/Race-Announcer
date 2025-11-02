import { Component, inject } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";


@Component({
    selector: 'app-clear-runners',
    templateUrl: './clear-runners.component.html',
    styleUrls: ['./clear-runners.component.css'],
    standalone: true,
    imports: []
})
export class ClearRunnersComponent {
  private runnerDataService = inject(RunnerDataService);

  clearStatus = '';

  clearActiveEntries() {
    this.runnerDataService.clearActiveRunners();
    this.clearStatus = 'Active Entries Cleared!';

    setTimeout(() => {
      this.clearStatus = '';
    }, 3000);
  }

  clearRunners() {
    this.runnerDataService.clearAllRunners();
    this.clearStatus = 'Runners Database Cleared!';

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
