import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy } from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [CommonModule]
})
export class RunnerTableComponent {
  private settingsService = inject(SettingsService);

  @Input() runners: Runner[] = [];
  @Input() selectable = false;
  @Input() selectedBib?: string;
  @Output() runnerSelected = new EventEmitter<Runner>();

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
}
