import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ANNOUNCE_TEMPLATE_OPTIONS, DEFAULT_SETTINGS, Settings, SettingsService } from '../services/settings.service';
import { MatConnection } from "../interfaces/mat-connection";
import { MatConnectionsEditorComponent } from "../mat-connections-editor/mat-connections-editor.component";
import { generateMatId, inferMatType, normalizeMatConnection } from "../utils/mat-connection-helpers";


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    standalone: true,
    imports: [ReactiveFormsModule, MatConnectionsEditorComponent]
})
export class SettingsComponent implements OnInit, AfterViewInit {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  settingsForm: FormGroup = new FormGroup({});
  templateOptions = ANNOUNCE_TEMPLATE_OPTIONS;
  status: string = '';
  readonly maxMatConnections = 3;

  ngOnInit(): void {
    this.settingsForm = this.formBuilder.group({
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
      minTimeMinutes: [Math.floor(DEFAULT_SETTINGS.minTimeMs / 60000)], // Minutes part
      minTimeSeconds: [(DEFAULT_SETTINGS.minTimeMs % 60000) / 1000],  // Seconds part
      numReconnectAttempts: [DEFAULT_SETTINGS.numReconnectAttempts],
      reconnectDelay: [DEFAULT_SETTINGS.reconnectDelay / 1000]
    });
    this.settingsService.getSettings().subscribe(settings => {
      console.log('Patching Values: ', settings);

      // Reset the form array
      this.customFields.clear();

      // Add new groups to the form array based on the settings
      settings.customFields.forEach(field => {
        this.customFields.push(this.formBuilder.group(field));
      });

      // Reset and populate mat connections
      this.matConnections.clear();
      settings.matConnections.forEach(mat => {
        this.matConnections.push(this.createMatConnectionGroup(mat));
      });

      this.settingsForm.patchValue({
        ...settings,
        minTimeMinutes: Math.floor(settings.minTimeMs / 60000),
        minTimeSeconds: (settings.minTimeMs % 60000) / 1000,
        reconnectDelay: settings.reconnectDelay / 1000
      });
    });

    console.log('Settings Initialized');
  }

  ngAfterViewInit(): void {
    this.restoreState();
  }

  onKeydown(event: KeyboardEvent, controlName: string) {
    this.settingsForm.get(controlName)?.setValue(event.key);
    event.preventDefault();  // prevent the default action (typing the key)
  }


  saveSettings(): void {
    const formValue = this.settingsForm.value;
    const matConnections = this.matConnections.getRawValue().map((connection: MatConnection) =>
      normalizeMatConnection({
        ...connection,
        id: connection.id || generateMatId(),
        port: typeof connection.port === 'string' ? Number(connection.port) : connection.port,
        type: inferMatType(connection.port, connection.type)
      })
    );

    const updatedSettings: Settings = {
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
      reconnectDelay: formValue.reconnectDelay * 1000
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
    this.status = 'success';
  }

  get customFields() {
    return this.settingsForm.get('customFields') as FormArray;
  }

  get matConnections() {
    return this.settingsForm.get('matConnections') as FormArray;
  }

  addField(): void {
    this.customFields.push(this.formBuilder.group({
      name: '',
      showInAnnounce: false,
      showInBrowse: false
    }));
  }

  removeField(index: number): void {
    this.customFields.removeAt(index);
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

  persistState(section: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    localStorage.setItem(section, JSON.stringify(isChecked));
  }

  restoreState(): void {
    const sections = [
      'race-settings',
      'timing-box-settings',
      'display-settings',
      'advanced-settings',
      'custom-fields'
    ];

    sections.forEach(section => {
      const storedState = localStorage.getItem(section);
      const state = storedState ? JSON.parse(storedState) : true;  // Default to true (uncollapsed)
      const element = document.getElementById(section) as HTMLInputElement;
      if (element) {
        element.checked = state;
      } else {
        console.warn("No element!: ",section)
      }
    });
  }
}
