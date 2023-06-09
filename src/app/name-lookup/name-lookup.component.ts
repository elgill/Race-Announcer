import {Component} from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";
import {Runner} from "../interfaces/runner";

@Component({
  selector: 'app-name-lookup',
  templateUrl: './name-lookup.component.html',
  styleUrls: ['./name-lookup.component.css']
})
export class NameLookupComponent {
  runners: Runner[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  async searchRunners(firstName?: string, lastName?: string) {
    this.runners = await this.runnerDataService.getRunnersByName(firstName, lastName);
  }
}

