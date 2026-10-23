import { Component, inject } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";

@Component({
    selector: 'app-csv-export',
    templateUrl: './csv-export.component.html',
    styleUrls: ['./csv-export.component.css'],
    standalone: true
})
export class CsvExportComponent {
  private runnerDataService = inject(RunnerDataService);

  exportRunners() {
    this.runnerDataService.exportRunners();
  }
}
