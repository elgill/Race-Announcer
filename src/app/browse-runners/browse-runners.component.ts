import {Component, OnInit} from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";
import {Runner} from "../interfaces/runner";
import {RunnerTableComponent} from "../runner-table/runner-table.component";

@Component({
    selector: 'app-browse-runners',
    templateUrl: './browse-runners.component.html',
    styleUrls: ['./browse-runners.component.css'],
    standalone: true,
    imports: [RunnerTableComponent]
})
export class BrowseRunnersComponent implements OnInit {
  runners: Runner[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  ngOnInit() {
    this.runners = this.runnerDataService.getSortedRunners();
  }
}
