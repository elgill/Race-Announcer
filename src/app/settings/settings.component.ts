import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ANNOUNCE_TEMPLATE_OPTIONS, DEFAULT_SETTINGS, Settings, SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup = new FormGroup({});
  templateOptions = ANNOUNCE_TEMPLATE_OPTIONS;
  status: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.settingsForm = this.formBuilder.group({
      fontSize: [DEFAULT_SETTINGS.fontSize],
      fontColor: [DEFAULT_SETTINGS.fontColor],
      displayLines: [DEFAULT_SETTINGS.displayLines],
      backgroundColor: [DEFAULT_SETTINGS.backgroundColor],
      proxyUrl: [DEFAULT_SETTINGS.proxyUrl],
      deleteKeybind: [DEFAULT_SETTINGS.deleteKeybind],
      announceTemplate: [DEFAULT_SETTINGS.announceTemplate],
      raceStartTime: [DEFAULT_SETTINGS.raceStartTime],
      numLockWarn: [DEFAULT_SETTINGS.numLockWarn],
      customFields: this.formBuilder.array(
        DEFAULT_SETTINGS.customFields.map((field) => this.formBuilder.group(field))
      ),
    });
    this.settingsService.getSettings().subscribe(settings => {
      console.log('Patching Values: ',settings);
      this.settingsForm.patchValue(settings);
    });

    console.log('Settings Initialized');
  }

  onKeydown(event: KeyboardEvent) {
    this.settingsForm.get('deleteKeybind')?.setValue(event.key);
    event.preventDefault();  // prevent the default action (typing the key)
  }


  saveSettings(): void {
    const updatedSettings = this.settingsForm.value as Settings;
    this.settingsService.updateSettings(updatedSettings);
    this.status = 'success';
  }

  get customFields() {
    return this.settingsForm.get('customFields') as FormArray;
  }

}
