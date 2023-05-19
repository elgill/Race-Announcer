import { Component, OnInit } from '@angular/core';
import {Runner, RunnerDataService} from '../services/runner-data.service';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-runner',
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements OnInit {
  settings: Settings= DEFAULT_SETTINGS;

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
