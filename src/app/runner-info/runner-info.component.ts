// runner-info.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { RunnerDataService } from '../services/runner-data.service';

@Component({
    selector: 'app-runner-info',
    templateUrl: './runner-info.component.html',
    styleUrls: ['./runner-info.component.css'],
    standalone: true
})
export class RunnerInfoComponent implements OnInit {
  private runnerDataService = inject(RunnerDataService);

  runnerCount = 0;
  xrefCount = 0;

  ngOnInit(): void {
    this.runnerDataService.getRunnerCount().subscribe(count => {
      this.runnerCount = count;
    });

    this.runnerDataService.getXrefCount().subscribe(count => {
      this.xrefCount = count;
    });
  }
}
