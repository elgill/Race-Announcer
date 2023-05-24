import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Settings {
  fontSize: number;
  fontColor: string;
  displayLines: number;
  backgroundColor: string;
  proxyUrl: string;
  deleteKeybind: string;
  announceTemplate: string;
}

export const ANNOUNCE_TEMPLATE_OPTIONS: { display: string; value: string }[] = [
  { display: 'Grid View', value: 'grid' },
  /*{ display: 'Test View', value: 'test' },*/
];

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 14,
  fontColor: '#000000',
  displayLines: 10,
  backgroundColor: '#ffffff',
  proxyUrl: '',
  deleteKeybind: 'Delete',
  announceTemplate: 'grid'
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settings: Settings = DEFAULT_SETTINGS;

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
      this.settings = DEFAULT_SETTINGS;
    }
  }
}
