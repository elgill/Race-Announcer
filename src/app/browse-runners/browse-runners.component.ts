import {Component, OnInit} from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";
import {Runner} from "../interfaces/runner";

@Component({
    selector: 'app-browse-runners',
    templateUrl: './browse-runners.component.html',
    styleUrls: ['./browse-runners.component.css'],
    standalone: false
})
export class BrowseRunnersComponent implements OnInit {
  runners: Runner[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  ngOnInit() {
    this.runners = this.runnerDataService.getSortedRunners();
  }
}
