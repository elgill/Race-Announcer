import {Component, OnInit} from '@angular/core';
import {Runner, RunnerDataService} from "../services/runner-data.service";

@Component({
  selector: 'app-browse-runners',
  templateUrl: './browse-runners.component.html',
  styleUrls: ['./browse-runners.component.css']
})
export class BrowseRunnersComponent implements OnInit {
  runners: Runner[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  ngOnInit() {
    this.runners = this.runnerDataService.getSortedRunners();
  }
}
