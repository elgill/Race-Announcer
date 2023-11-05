import { Component } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";

@Component({
  selector: 'app-auto-import',
  templateUrl: './auto-import.component.html',
  styleUrls: ['./auto-import.component.css']
})
export class AutoImportComponent {
  constructor(private runnerDataService: RunnerDataService) { }
  importRunners():string {
    return this.runnerDataService.autoImportRunners();
  }
}
