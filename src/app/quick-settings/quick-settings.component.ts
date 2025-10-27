import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";
import {RaceService} from "../services/race.service";


interface Race {
  id: string;
  name: string;
  date: string;
  location: string;
}

@Component({
    selector: 'app-quick-settings',
    templateUrl: './quick-settings.component.html',
    styleUrl: './quick-settings.component.css',
    standalone: true,
    imports: [ReactiveFormsModule]
})
export class QuickSettingsComponent implements OnInit {
  quickSetupForm: FormGroup = new FormGroup({});
  races: Race[] = [];
  isLoading = false;
  errorMessage = '';
  settings = DEFAULT_SETTINGS;
  status: string = '';
  settingsSaved: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private raceService: RaceService,
  ) {
  }

  ngOnInit(): void {
    this.quickSetupForm = this.formBuilder.group({
      fontSize: [DEFAULT_SETTINGS.fontSize],
      fontColor: [DEFAULT_SETTINGS.fontColor],
      displayLines: [DEFAULT_SETTINGS.displayLines],
      backgroundColor: [DEFAULT_SETTINGS.backgroundColor],
      proxyUrl: [DEFAULT_SETTINGS.proxyUrl],
      deleteKeybind: [DEFAULT_SETTINGS.deleteKeybind],
      pauseKeybind: [DEFAULT_SETTINGS.pauseKeybind],
      announceTemplate: [DEFAULT_SETTINGS.announceTemplate],
      raceStartTime: [DEFAULT_SETTINGS.raceStartTime],
      numLockWarn: [DEFAULT_SETTINGS.numLockWarn],
      raceId: [DEFAULT_SETTINGS.raceId],
      ip: [DEFAULT_SETTINGS.ip],
      port: [DEFAULT_SETTINGS.port],
      customFields: this.formBuilder.array([]),
      minTimeMs: [DEFAULT_SETTINGS.minTimeMs],
      minTimeMinutes: [Math.floor(DEFAULT_SETTINGS.minTimeMs / 60000)], // Minutes part
      minTimeSeconds: [(DEFAULT_SETTINGS.minTimeMs % 60000) / 1000],  // Seconds part
      numReconnectAttempts: [DEFAULT_SETTINGS.numReconnectAttempts],
      reconnectDelay: [DEFAULT_SETTINGS.reconnectDelay]
    });
    this.settingsService.getSettings().subscribe(settings => {
      console.log('Patching Values: ', settings);
      // Reset the form array
      this.customFields.clear();

      // Add new groups to the form array based on the settings
      settings.customFields.forEach(field => {
        this.customFields.push(this.formBuilder.group(field));
      });

      this.quickSetupForm.patchValue({
        ...settings,
      });
    });

    console.log('Settings Initialized');
  }

  get customFields() {
    return this.quickSetupForm.get('customFields') as FormArray;
  }


  saveSettings(): void {
    if (this.quickSetupForm.valid) {
      this.settingsService.updateSettings(this.quickSetupForm.value as Settings);

      this.settingsSaved = true;

      setTimeout(() => {
        this.settingsSaved = false;
      }, 3000);
    }
  }

  fetchRaces(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.raceService.fetchRaces().subscribe(
      (races) => {
        this.races = races;
        this.isLoading = false;
      },
      (error) => {
        this.errorMessage = 'Failed to fetch races. Please try again.';
        console.log(error);
        this.isLoading = false;
      }
    );
  }

  selectRace(race: Race): void {
    this.quickSetupForm.patchValue({
      raceId: race.id
    });
  }
}
