import { Component, OnInit } from '@angular/core';
import {RunnerDataService} from '../services/runner-data.service';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";
import {CustomField} from "../interfaces/custom-field";
import {Runner} from "../interfaces/runner";

@Component({
  selector: 'app-announce',
  templateUrl: './announce-screen.component.html',
  styleUrls: ['./announce-screen.component.css']
})
export class AnnounceScreenComponent implements OnInit {
  settings: Settings= DEFAULT_SETTINGS;
  runStartTime: Date | undefined;

  runnerList: Runner[] = [];
  isNumLockOff = false;
  customFields: CustomField[] = [];


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
      this.runStartTime = new Date(settings.raceStartTime);
    });
    window.addEventListener('keydown', (event: KeyboardEvent) => {
      this.isNumLockOff = event.getModifierState && !event.getModifierState('NumLock');
    });

    this.customFields = this.settings.customFields.filter(field => field.showInAnnounce)
  }

}
