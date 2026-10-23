// runner-info.component.ts
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RunnerDataService } from '../services/runner-data.service';

@Component({
    selector: 'app-runner-info',
    templateUrl: './runner-info.component.html',
    styleUrls: ['./runner-info.component.css'],
    standalone: true
})
export class RunnerInfoComponent {
  private runnerDataService = inject(RunnerDataService);

  runnerCount = toSignal(this.runnerDataService.getRunnerCount(), { initialValue: 0 });
  xrefCount = toSignal(this.runnerDataService.getXrefCount(), { initialValue: 0 });
}
