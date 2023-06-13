import {Component, Input} from '@angular/core';
import {CustomField} from "../interfaces/custom-field";
import {SettingsService} from "../services/settings.service";
import {Runner} from "../interfaces/runner";

@Component({
  selector: 'app-runner-table',
  templateUrl: './runner-table.component.html',
  styleUrls: ['./runner-table.component.css']
})
export class RunnerTableComponent {
  @Input() runners: Runner[] = [];

  customFields: CustomField[] = [];

  constructor(private settingsService: SettingsService) {
    this.settingsService.getSettings().subscribe(settings => {
      this.customFields = settings.customFields;
    });
  }
}
