import {Component, OnInit} from '@angular/core';
import {Runner, RunnerDataService} from "../services/runner-data.service";

@Component({
  selector: 'app-name-lookup',
  templateUrl: './name-lookup.component.html',
  styleUrls: ['./name-lookup.component.css']
})
export class NameLookupComponent implements OnInit {
  runners: Runner[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  ngOnInit() {
  }

  async searchRunners(firstName?: string, lastName?: string) {
    this.runners = await this.runnerDataService.getRunnersByName(firstName, lastName);
  }
}

