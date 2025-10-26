import { Component } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";

@Component({
    selector: 'app-csv-export',
    templateUrl: './csv-export.component.html',
    styleUrls: ['./csv-export.component.css'],
    standalone: false
})
export class CsvExportComponent {
  constructor(private runnerDataService: RunnerDataService) { }
  exportRunners() {
    this.runnerDataService.exportRunners();
  }
}
