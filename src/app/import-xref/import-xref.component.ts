import { Component, inject, signal } from '@angular/core';
import { DEFAULT_SETTINGS, Settings, SettingsService } from "../services/settings.service";
import * as Papa from 'papaparse';
import { RunnerDataService } from "../services/runner-data.service";


@Component({
    selector: 'app-import-xref',
    templateUrl: './import-xref.component.html',
    styleUrls: ['./import-xref.component.css'],
    standalone: true,
    imports: []
})
export class ImportXrefComponent {
  private runnerDataService = inject(RunnerDataService);
  private settingsService = inject(SettingsService);

  settings: Settings = DEFAULT_SETTINGS;
  errorMessage: string = '';
  file = signal<File | null>(null);
  importStatus = signal('');

  constructor() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  onFileSelected(event: any): void {
    this.file.set(event.target.files[0] ?? null);
  }

  importFile(): void {
    const file = this.file();
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const parsedData = Papa.parse(csv, {
          header: false,
          skipEmptyLines: true
        }).data as string[][];

        const xrefData = parsedData.map(row => ({ bib: row[0], chipId: row[1] }));
        this.runnerDataService.importXref(xrefData);

        this.importStatus.set('success');
        this.clear();
      };
      reader.readAsText(file);
    }
  }

  private clear(): void {
    this.file.set(null);
  }
}
