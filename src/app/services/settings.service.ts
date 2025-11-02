import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CustomField } from "../interfaces/custom-field";
import { ConfigService } from './config.service';
import { MatConnection } from "../interfaces/mat-connection";
import { generateMatId, inferMatType, normalizeMatConnection } from "../utils/mat-connection-helpers";

export interface Settings {
  minTimeMs: number;
  reconnectDelay: number;
  numReconnectAttempts: number;
  fontSize: number;
  fontColor: string;
  displayLines: number;
  backgroundColor: string;
  proxyUrl: string;
  deleteKeybind: string;
  pauseKeybind: string;
  announceTemplate: string;
  raceStartTime: string;
  numLockWarn: boolean;
  raceId: string;
  ip: string, // Deprecated: kept for backward compatibility
  port: number, // Deprecated: kept for backward compatibility
  matConnections: MatConnection[];
  customFields: CustomField[];
}

export const ANNOUNCE_TEMPLATE_OPTIONS: { display: string; value: string }[] = [
  { display: 'Grid View', value: 'grid' },
  { display: 'Freeform View', value: 'freeform' },
  { display: 'Timer View', value: 'timer'},
  { display: 'Recency View', value: 'recency'}
];

export const DEFAULT_SETTINGS: Settings = {
  fontSize: 32,
  fontColor: '#000000',
  displayLines: 50,
  backgroundColor: '#ffffff',
  proxyUrl: '',
  deleteKeybind: 'Delete',
  pauseKeybind: ' ',
  announceTemplate: 'freeform',
  raceStartTime: '',
  numLockWarn: false,
  raceId: '',
  ip: '',
  port: 10001,
  matConnections: [],
  customFields: [
    { name: "division", showInAnnounce: true, showInBrowse: true },
    { name: "t-shirt", showInAnnounce: false, showInBrowse: true },
    { name: "team", showInAnnounce: true, showInBrowse: true }
  ],
  minTimeMs: 300000,
  numReconnectAttempts: 5,
  reconnectDelay: 10000
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private configService = inject(ConfigService);

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
          this.settings[key] = loadedSettings[key] as never;
        }
      }

      // Migration: Convert old ip/port settings to matConnections if needed
      if (this.settings.matConnections.length === 0 && this.settings.ip && this.settings.port) {
        this.settings.matConnections = [{
          id: 'mat-1',
          label: 'Timing Mat 1',
          ip: this.settings.ip,
          port: this.settings.port,
          enabled: true,
          type: inferMatType(this.settings.port)
        }];
        console.log("Migrated old ip/port settings to matConnections");
        this.saveSettings(); // Save migrated settings
      }

      this.settings.matConnections = this.settings.matConnections.map(mat =>
        normalizeMatConnection({
          ...mat,
          id: mat.id || generateMatId(),
          label: mat.label || 'Timing Mat',
          enabled: mat.enabled ?? true,
          type: inferMatType(mat.port, mat.type)
        })
      );

      console.log("Merged Settings:",this.settings);
      this.settings$.next(this.settings);
    } else {
      // Default settings
      this.settings = DEFAULT_SETTINGS;
      this.settings['proxyUrl']=this.configService.getProxyUrl();
      console.log('Proxy URL: ',this.configService.getProxyUrl());
    }
  }

  setRaceStartTime(time: string){
    this.settings.raceStartTime = time;
    this.settings$.next(this.settings);
  }
}
