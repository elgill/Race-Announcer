import { Component, inject } from '@angular/core';
import { CsvColumnMappingService } from '../services/csv-column-mapping.service';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-csv-import',
    templateUrl: './csv-import.component.html',
    styleUrls: ['./csv-import.component.css'],
    standalone: true,
    imports: [FormsModule]
})
export class CsvImportComponent {
  private csvService = inject(CsvColumnMappingService);
  private settingsService = inject(SettingsService);

  settings: Settings = DEFAULT_SETTINGS;
  errorMessage: string = '';
  file: File | null = null;
  headers: string[] = [];
  importStatus = '';
  mappedColumns: { [key: string]: string } = {};
  possibleHeaders: { [key: string]: string[] } = {
    'bib': ['Bib', 'Bib Number', 'Bib#', 'bib #'],
    'firstName': ['First Name', 'FirstName', 'first_name', 'first'],
    'lastName': ['Last Name', 'LastName', 'last_name','last'],
    'age': ['Age', 'age', 'Age Group'],
    'gender': ['Gender', 'gender', 'Sex'],
    'town': ['Town', 'town', 'City'],
    'state': ['State', 'state', 'Province'],
  };

  constructor() {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  onFileSelected(event: any) {
    this.errorMessage = '';
    this.file = event.target.files[0];
    this.importStatus = '';
    if (this.file !== null) {
      this.csvService.getHeaders(this.file)
        .then(headers => {
          // Initialize mappedColumns with all headers mapped to an empty string
          for (const header of headers) {
            this.mappedColumns[header] = '';
          }

          // Automatically map columns
          for (const runnerField of Object.keys(this.possibleHeaders)) {
            const matchingHeader = headers.find(header =>
              this.possibleHeaders[runnerField].map(h => h.toLowerCase()).includes(header.toLowerCase())
            );
            if (matchingHeader !== undefined) {
              this.mappedColumns[matchingHeader] = runnerField;
            }
          }

          this.headers = headers;

        })
        .catch(error => {
          console.error('Error getting headers from CSV file:', error);
          this.errorMessage = 'There was an error getting headers from the CSV file. Please verify file';
          this.clear();
        });

    }
  }

  private clear(){
    this.file = null;
    this.headers = [];
  }

  importCsv() {
    if (this.file !== null) {
      // Flip the mappings
      const columnMappings: { [key: string]: string } = {};
      for (const header of Object.keys(this.mappedColumns)) {
        const runnerField = this.mappedColumns[header];
        columnMappings[runnerField] = header;
      }

      this.csvService.importCsv(this.file, columnMappings)
        .then(runners => {
          // The promise was fulfilled, so you can do something with the runners here.
          console.log('Import successful, runners:', runners);
          this.importStatus = 'success';
        })
        .catch(error => {
          // The promise was rejected, so you can handle the error here.
          console.log('Import failed, error:', error);
          this.errorMessage = 'Import failed, please verify file';
        });
      this.clear();
    }
  }


}
