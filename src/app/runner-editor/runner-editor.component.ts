import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Runner} from "../interfaces/runner";
import {RunnerDataService} from "../services/runner-data.service";
import {SettingsService} from "../services/settings.service";

@Component({
    selector: 'app-runner-editor',
    templateUrl: './runner-editor.component.html',
    styleUrls: ['./runner-editor.component.css'],
    standalone: true,
    imports: [FormsModule]
})
export class RunnerEditorComponent implements OnChanges {
  private runnerDataService = inject(RunnerDataService);
  private settingsService = inject(SettingsService);

  // The runner being edited, or null to add a new one
  @Input() runner: Runner | null = null;
  @Output() saved = new EventEmitter<Runner>();
  @Output() deleted = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  draft: Runner = emptyRunner();
  customFieldNames: string[] = [];
  errorMessage = '';
  confirmingDelete = false;

  private settingsFieldNames: string[] = [];

  constructor() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settingsFieldNames = settings.customFields.map(field => field.name);
      this.updateCustomFieldNames();
    });
  }

  get isNew(): boolean {
    return this.runner === null;
  }

  ngOnChanges() {
    this.draft = this.runner
      ? {...this.runner, customFields: {...this.runner.customFields}}
      : emptyRunner();
    this.errorMessage = '';
    this.confirmingDelete = false;
    this.updateCustomFieldNames();
  }

  async save() {
    this.errorMessage = '';
    const runner: Runner = {
      ...this.draft,
      bib: String(this.draft.bib ?? '').trim(),
      age: Number(this.draft.age) || 0,
    };
    try {
      await this.runnerDataService.saveRunner(runner, this.runner?.bib);
      this.saved.emit(runner);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  async delete() {
    if (!this.runner) {
      return;
    }
    if (!this.confirmingDelete) {
      this.confirmingDelete = true;
      return;
    }
    try {
      await this.runnerDataService.deleteRunner(this.runner.bib);
      this.deleted.emit(this.runner.bib);
    } catch (err) {
      this.errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  private updateCustomFieldNames() {
    // Show configured fields plus any extra fields this runner already carries
    const names = new Set([...this.settingsFieldNames, ...Object.keys(this.draft.customFields)]);
    this.customFieldNames = Array.from(names);
  }
}

function emptyRunner(): Runner {
  return {
    id: '',
    bib: '',
    firstName: '',
    lastName: '',
    age: 0,
    gender: '',
    town: '',
    state: '',
    customFields: {}
  };
}
