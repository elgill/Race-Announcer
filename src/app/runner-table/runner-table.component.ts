import { Component, Input, inject } from '@angular/core';
import {CustomField} from "../interfaces/custom-field";
import {SettingsService} from "../services/settings.service";
import {Runner} from "../interfaces/runner";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-runner-table',
    templateUrl: './runner-table.component.html',
    styleUrls: ['./runner-table.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class RunnerTableComponent {
  private settingsService = inject(SettingsService);

  @Input() runners: Runner[] = [];

  startTime = 0;
  customFields$: Observable<CustomField[]>;
  displayLimit = 500;

  constructor() {
    this.customFields$ = this.settingsService.getSettings().pipe(
      map(settings => settings.customFields.filter(field => field.showInBrowse))
    );
  }

  loadAll() {
    this.displayLimit = Number.MAX_SAFE_INTEGER;
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
