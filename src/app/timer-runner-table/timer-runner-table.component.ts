import {Component, Input} from '@angular/core';
import {Runner} from "../interfaces/runner";
import {Observable} from "rxjs";
import {CustomField} from "../interfaces/custom-field";
import {SettingsService} from "../services/settings.service";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-timer-runner-table',
  templateUrl: './timer-runner-table.component.html',
  styleUrls: ['./timer-runner-table.component.css']
})
export class TimerRunnerTableComponent {
  @Input() runners: Runner[] = [];
  @Input() showTime: boolean = false;

  customFields$: Observable<CustomField[]>;

  constructor(private settingsService: SettingsService) {
    this.customFields$ = this.settingsService.getSettings().pipe(
      map(settings => settings.customFields.filter(field => field.showInBrowse))
    );
  }
}
