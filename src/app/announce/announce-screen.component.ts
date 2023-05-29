import { Component, OnInit } from '@angular/core';
import {Runner, RunnerDataService} from '../services/runner-data.service';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-announce',
  templateUrl: './announce-screen.component.html',
  styleUrls: ['./announce-screen.component.css']
})
export class AnnounceScreenComponent implements OnInit {
  settings: Settings= DEFAULT_SETTINGS;

  runnerList: Runner[] = [];
  isNumLockOff = false;

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
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.isNumLockOff = event.getModifierState && !event.getModifierState('NumLock');
    });
  }

}
