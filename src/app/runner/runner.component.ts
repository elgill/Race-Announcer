import { Component, OnInit } from '@angular/core';
import {Runner, RunnerDataService} from '../services/runner-data.service';

@Component({
  selector: 'app-runner',
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements OnInit {

  runnerList: Runner[] = [];

  constructor(private runnerDataService: RunnerDataService) { }

  ngOnInit(): void {
    this.runnerDataService.getRunners().subscribe(runners => {
      this.runnerList = runners;
    });
  }

}
