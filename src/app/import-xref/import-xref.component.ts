import { Component } from '@angular/core';
import { DEFAULT_SETTINGS, Settings, SettingsService } from "../services/settings.service";
import * as Papa from 'papaparse';
import { RunnerDataService } from "../services/runner-data.service";

@Component({
  selector: 'app-import-xref',
  templateUrl: './import-xref.component.html',
  styleUrls: ['./import-xref.component.css']
})
export class ImportXrefComponent {
  settings: Settings = DEFAULT_SETTINGS;
  errorMessage: string = '';
  file: File | null = null;
  importStatus = '';

  constructor(private runnerDataService: RunnerDataService, private settingsService: SettingsService) {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  importFile(): void {
    if (this.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result as string;
        const parsedData = Papa.parse(csv, {
          header: false,
          skipEmptyLines: true
        }).data as string[][];

        const xrefData = parsedData.map(row => ({ bib: row[0], chipId: row[1] }));
        this.runnerDataService.importXref(xrefData);

        this.importStatus = 'success';
        this.clear();
      };
      reader.readAsText(this.file);
    }
  }

  private clear(): void {
    this.file = null;
  }
}
