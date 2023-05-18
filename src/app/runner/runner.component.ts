import { Component, OnInit } from '@angular/core';
import {Runner, RunnerDataService} from '../services/runner-data.service';
import {Settings, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-runner',
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements OnInit {
  settings: Settings= {
    fontSize: 12,
    fontColor: '#000000',
    backgroundColor: '#FFFFFF',
    displayLines: 10
  };

  runnerList: Runner[] = [];

  constructor(
    private runnerDataService: RunnerDataService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.runnerDataService.getActiveRunners().subscribe(runners => {
      this.runnerList = runners;
    });

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

}
