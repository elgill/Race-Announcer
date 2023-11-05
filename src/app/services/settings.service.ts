import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomField } from "../interfaces/custom-field";

export interface Settings {
  fontSize: number;
  fontColor: string;
  displayLines: number;
  backgroundColor: string;
  proxyUrl: string;
  deleteKeybind: string;
  announceTemplate: string;
  raceStartTime: string;
  numLockWarn: boolean;
  raceId: string;
  customFields: CustomField[];
}

export const ANNOUNCE_TEMPLATE_OPTIONS: { display: string; value: string }[] = [
  { display: 'Grid View', value: 'grid' },
  { display: 'Freeform View', value: 'freeform' },
];

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 32,
  fontColor: '#000000',
  displayLines: 50,
  backgroundColor: '#ffffff',
  proxyUrl: '',
  deleteKeybind: 'Delete',
  announceTemplate: 'freeform',
  raceStartTime: '',
  numLockWarn: false,
  raceId: '',
  customFields: [
    { name: "CustomField1", showInAnnounce: false, showInBrowse: false }
  ],
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
      const loadedSettings = JSON.parse(settingsStr) as Partial<Settings>;
      this.settings = { ...DEFAULT_SETTINGS } as Settings;  // start with default settings

      console.log("Default Settings:",DEFAULT_SETTINGS);
      console.log("Set Settings:",loadedSettings);

      // iterate through the keys of the default settings
      for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
        // if a key is present in the loaded settings, use its value
        if (key in loadedSettings) {
          console.log("Key:",key," Value:",this.settings[key]);
          this.settings[key] = loadedSettings[key] as never;
        }
      }
      console.log("Merged Settings:",this.settings);
      this.settings$.next(this.settings);
    } else {
      // Default settings
      this.settings = DEFAULT_SETTINGS;
    }
  }

  setRaceStartTime(time: string){
    this.settings.raceStartTime = time;
    this.settings$.next(this.settings);
  }
}
