import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Settings {
  fontSize: number;
  fontColor: string;
  displayLines: number;
  backgroundColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings: Settings = {
    fontSize: 14,
    fontColor: '#000000',
    displayLines: 5,
    backgroundColor: '#ffffff'
  };

  private settings$ = new BehaviorSubject<Settings>(this.settings);

  constructor() {
    this.loadSettings();
  }

  getSettings() {
    return this.settings$.asObservable();
  }

  updateSettings(newSettings: Settings) {
    this.settings = newSettings;
    this.settings$.next(this.settings);
    console.log("Settings updated: ", this.settings)
    this.saveSettings();
  }

  private saveSettings() {
    localStorage.setItem('settings', JSON.stringify(this.settings));
  }

  private loadSettings() {
    const settingsStr = localStorage.getItem('settings');
    if (settingsStr) {
      this.settings = JSON.parse(settingsStr);
      this.settings$.next(this.settings);
    } else {
      // Default settings
      this.settings = {
        fontSize: 14,
        fontColor: '#000000',
        displayLines: 10,
        backgroundColor: '#ffffff'
      };
    }
  }
}
