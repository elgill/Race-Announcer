import { Component, Input, inject } from '@angular/core';
import {Runner} from "../interfaces/runner";
import {Observable} from "rxjs";
import {CustomField} from "../interfaces/custom-field";
import {SettingsService} from "../services/settings.service";
import {map} from "rxjs/operators";
import {BibEntryComponent} from "../bib-entry/bib-entry.component";
import {RaceClockComponent} from "../race-clock/race-clock.component";
import {AnnounceTimerComponent} from "../announce/announce-timer/announce-timer.component";

@Component({
    selector: 'app-timer-runner-table',
    templateUrl: './timer-runner-table.component.html',
    styleUrls: ['./timer-runner-table.component.css'],
    standalone: true,
    imports: [BibEntryComponent, RaceClockComponent, AnnounceTimerComponent]
})
export class TimerRunnerTableComponent {
  private settingsService = inject(SettingsService);

  @Input() runners: Runner[] = [];
  @Input() showTime: boolean = false;

  customFields$: Observable<CustomField[]>;

  constructor() {
    this.customFields$ = this.settingsService.getSettings().pipe(
      map(settings => settings.customFields.filter(field => field.showInBrowse))
    );
  }

  // PERFORMANCE FIX: Add trackBy function for efficient list rendering
  trackByBib(index: number, runner: Runner): string {
    return runner.bib;
  }

  // PERFORMANCE FIX: Add trackBy function for custom fields
  trackByFieldName(index: number, field: CustomField): string {
    return field.name;
  }
}
