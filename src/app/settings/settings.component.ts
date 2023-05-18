import { Component, OnInit } from '@angular/core';
import { Settings, SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: Settings= {
    fontSize: 14,
    fontColor: '#000000',
    displayLines: 5,
    backgroundColor: '#ffffff'
  };

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
