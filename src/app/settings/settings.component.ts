import { Component, OnInit } from '@angular/core';
import {DEFAULT_SETTINGS, Settings, SettingsService} from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: Settings= DEFAULT_SETTINGS;

  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  saveSettings(): void {
    this.settingsService.updateSettings(this.settings);
  }
}
