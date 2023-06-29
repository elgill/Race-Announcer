import {Component, Input} from '@angular/core';
import {CustomField} from "../interfaces/custom-field";
import {SettingsService} from "../services/settings.service";
import {Runner} from "../interfaces/runner";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-runner-table',
  templateUrl: './runner-table.component.html',
  styleUrls: ['./runner-table.component.css']
})
export class RunnerTableComponent {
  @Input() runners: Runner[] = [];

  startTime = 0;
  customFields$: Observable<CustomField[]>;
  displayLimit = 500;

  constructor(private settingsService: SettingsService) {
    this.customFields$ = this.settingsService.getSettings().pipe(
      map(settings => settings.customFields.filter(field => field.showInBrowse))
    );
  }

  loadAll() {
    this.displayLimit = Number.MAX_SAFE_INTEGER;
  }
}
