import { Component, inject, signal } from '@angular/core';
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

  clearStatus = signal('');

  clearActiveEntries() {
    this.runnerDataService.clearActiveRunners();
    this.clearStatus.set('Active Entries Cleared!');

    setTimeout(() => {
      this.clearStatus.set('');
    }, 3000);
  }

  clearRunners() {
    this.runnerDataService.clearAllRunners();
    this.clearStatus.set('Runners Database Cleared!');

    setTimeout(() => {
      this.clearStatus.set('');
    }, 3000);
  }

  clearXref() {
    this.runnerDataService.clearXref();
    this.clearStatus.set('XREF Cleared!');

    setTimeout(() => {
      this.clearStatus.set('');
    }, 3000);
  }
}
