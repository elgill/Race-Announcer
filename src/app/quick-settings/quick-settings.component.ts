import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { DEFAULT_SETTINGS, Settings, SettingsService } from "../services/settings.service";
import { RaceService } from "../services/race.service";
import { MatConnectionsEditorComponent } from "../mat-connections-editor/mat-connections-editor.component";
import { MatConnection } from "../interfaces/mat-connection";
import { generateMatId, inferMatType, normalizeMatConnection } from "../utils/mat-connection-helpers";
import { Subscription, debounceTime, filter } from "rxjs";

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
export class QuickSettingsComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private raceService = inject(RaceService);

  quickSetupForm: FormGroup = new FormGroup({});
  races: Race[] = [];
  isLoading = false;
  errorMessage = '';
  settings = DEFAULT_SETTINGS;
  readonly maxMatConnections = 3;
  private formChangesSub?: Subscription;
  private isUpdatingForm = false;
  private autoSaveReady = false;

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

    this.formChangesSub = this.quickSetupForm.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => this.autoSaveReady && !this.isUpdatingForm)
      )
      .subscribe(() => this.saveSettings(true));

    this.settingsService.getSettings().subscribe(settings => {
      console.log('Patching Values: ', settings);

      this.isUpdatingForm = true;

      this.customFields.clear();
      settings.customFields.forEach(field => {
        this.customFields.push(this.formBuilder.group(field));
      });

      this.matConnections.clear();
      settings.matConnections.forEach(mat => {
        this.matConnections.push(this.createMatConnectionGroup(mat));
      });

      this.quickSetupForm.patchValue({
        ...settings,
        raceStartTime: settings.raceStartTime ? this.toLocalInputDateTime(settings.raceStartTime) : '',
        minTimeMinutes: Math.floor(settings.minTimeMs / 60000),
        minTimeSeconds: (settings.minTimeMs % 60000) / 1000,
      }, { emitEvent: false });

      this.settings = settings;
      this.isUpdatingForm = false;
      this.autoSaveReady = true;
    });

    console.log('Settings Initialized');
  }

  ngOnDestroy(): void {
    this.formChangesSub?.unsubscribe();
  }

  get customFields() {
    return this.quickSetupForm.get('customFields') as FormArray;
  }

  get matConnections() {
    return this.quickSetupForm.get('matConnections') as FormArray;
  }

  saveSettings(silent = false): void {
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
      raceStartTime: formValue.raceStartTime ? new Date(formValue.raceStartTime).toISOString() : '',
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
    if (this.areSettingsEqual(updatedSettings, this.settings)) {
      return;
    }
    this.settingsService.updateSettings(updatedSettings);
    this.settings = updatedSettings;
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

  private toLocalInputDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const pad = (num: number, size = 2) => String(num).padStart(size, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const millis = date.getMilliseconds();
    const millisPart = millis ? `.${pad(millis, 3)}` : '';
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${millisPart}`;
  }

  private areSettingsEqual(a: Settings, b: Settings): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
