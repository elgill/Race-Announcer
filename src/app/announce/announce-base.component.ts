import { Component, OnInit } from '@angular/core';
import {RunnerDataService} from '../services/runner-data.service';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";
import {CustomField} from "../interfaces/custom-field";
import {Runner} from "../interfaces/runner";
import {ElectronService} from "../services/electron.service";

@Component({
  template: '',
  standalone: true
})
export class AnnounceBaseComponent implements OnInit {
  settings: Settings= DEFAULT_SETTINGS;
  runStartTime: Date | undefined;
  isElectron = this.electronService.isElectron;

  runnerList: Runner[] = [];
  reverseRunnerList: Runner[] = [];
  isNumLockOff = false;
  customFields: CustomField[] = [];

  paused = false;
  pausedQueueLength = 0;

  constructor(
    protected runnerDataService: RunnerDataService,
    protected settingsService: SettingsService,
    protected electronService: ElectronService,
  ) { }

  ngOnInit(): void {
    this.runnerDataService.getActiveRunners().subscribe(runners => {
      this.runnerList = runners;
      this.reverseRunnerList = [...runners].reverse();
    });

    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
      if(settings.raceStartTime){
        this.runStartTime = new Date(settings.raceStartTime);
      } else {
        this.runStartTime = undefined
      }
    });
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.isNumLockOff = event.getModifierState && !event.getModifierState('NumLock');
    });

    this.customFields = this.settings.customFields.filter(field => field.showInAnnounce)

    this.runnerDataService.getPausedStatus().subscribe(paused => {
      this.paused = paused;
    });

    this.runnerDataService.getPausedQueue().subscribe(queue => {
      this.pausedQueueLength = queue.length;
    });
  }
}
