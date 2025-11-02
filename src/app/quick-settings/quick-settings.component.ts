import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { DEFAULT_SETTINGS, Settings, SettingsService } from "../services/settings.service";
import { RaceService } from "../services/race.service";
import { MatConnectionsEditorComponent } from "../mat-connections-editor/mat-connections-editor.component";
import { MatConnection } from "../interfaces/mat-connection";
import { generateMatId, inferMatType, normalizeMatConnection } from "../utils/mat-connection-helpers";

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
    imports: [ReactiveFormsModule, MatConnectionsEditorComponent]
})
export class QuickSettingsComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private raceService = inject(RaceService);

  quickSetupForm: FormGroup = new FormGroup({});
  races: Race[] = [];
  isLoading = false;
  errorMessage = '';
  settings = DEFAULT_SETTINGS;
  status: string = '';
  settingsSaved: boolean = false;
  readonly maxMatConnections = 3;

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
      matConnections: this.formBuilder.array([]),
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

      this.matConnections.clear();
      settings.matConnections.forEach(mat => {
        this.matConnections.push(this.createMatConnectionGroup(mat));
      });

      this.quickSetupForm.patchValue({
        ...settings,
        minTimeMinutes: Math.floor(settings.minTimeMs / 60000),
        minTimeSeconds: (settings.minTimeMs % 60000) / 1000,
      });

      this.settings = settings;
    });

    console.log('Settings Initialized');
  }

  get customFields() {
    return this.quickSetupForm.get('customFields') as FormArray;
  }

  get matConnections() {
    return this.quickSetupForm.get('matConnections') as FormArray;
  }

  saveSettings(): void {
    if (!this.quickSetupForm.valid) {
      return;
    }

    const formValue = this.quickSetupForm.value;
    const matConnections = this.matConnections.getRawValue().map((connection: MatConnection) =>
      normalizeMatConnection({
        ...connection,
        id: connection.id || generateMatId(),
        port: typeof connection.port === 'string' ? Number(connection.port) : connection.port,
        type: inferMatType(connection.port, connection.type)
      })
    );

    const updatedSettings: Settings = {
      ...this.settings,
      fontSize: formValue.fontSize,
      fontColor: formValue.fontColor,
      displayLines: formValue.displayLines,
      backgroundColor: formValue.backgroundColor,
      proxyUrl: formValue.proxyUrl,
      deleteKeybind: formValue.deleteKeybind,
      pauseKeybind: formValue.pauseKeybind,
      announceTemplate: formValue.announceTemplate,
      raceStartTime: formValue.raceStartTime,
      numLockWarn: formValue.numLockWarn,
      raceId: formValue.raceId,
      ip: formValue.ip,
      port: formValue.port,
      matConnections,
      customFields: formValue.customFields,
      minTimeMs: (formValue.minTimeMinutes * 60000) + (formValue.minTimeSeconds * 1000),
      numReconnectAttempts: formValue.numReconnectAttempts,
      reconnectDelay: formValue.reconnectDelay
    };

    if (updatedSettings.matConnections.length > 0) {
      const [primaryMat] = updatedSettings.matConnections;
      updatedSettings.ip = primaryMat.ip;
      updatedSettings.port = primaryMat.port;
    } else {
      updatedSettings.ip = '';
      updatedSettings.port = DEFAULT_SETTINGS.port;
    }

    this.settingsService.updateSettings(updatedSettings);
    this.settings = updatedSettings;

    this.settingsSaved = true;

    setTimeout(() => {
      this.settingsSaved = false;
    }, 3000);
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

  private createMatConnectionGroup(mat?: MatConnection): FormGroup {
    const type = inferMatType(mat?.port, mat?.type);
    return this.formBuilder.group({
      id: [mat?.id ?? generateMatId()],
      label: [mat?.label ?? ''],
      ip: [mat?.ip ?? '192.168.1.'],
      port: [mat?.port ?? DEFAULT_SETTINGS.port],
      enabled: [mat?.enabled ?? true],
      type: [type]
    });
  }
}
