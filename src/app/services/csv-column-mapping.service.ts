import { Injectable } from '@angular/core';
import {Runner, RunnerDataService} from './runner-data.service';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvColumnMappingService {

  constructor(private runnerDataService: RunnerDataService) { }

  getHeaders(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: (results, parser) => {
          if (results.errors.length > 0) {
            reject(results.errors);
            parser.abort();
          } else if (results.meta.fields) {
            resolve(results.meta.fields);
            parser.abort();
          }
        },
        complete: (results) => {
          if (!results.meta.aborted && results.errors.length === 0) {
            reject('No headers found in CSV file.');
          }
        }
      });
    });
  }

  importCsv(file: File, columnMappings: { [key: string]: string }): Promise<Runner[]> {
    return new Promise((resolve, reject) => {
      const runners: Runner[] = [];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: (results) => {
          console.log('Raw CSV row:', results.data);  // Debug: Log raw CSV row

          const row = results.data as Record<string, string>; // Tell TypeScript we expect results.data to be an object with string keys and values
          console.log('Column Mappings: ',columnMappings);

          // Skip row if it has too few fields or if key fields are empty
          if (Object.keys(row).length < Object.keys(columnMappings).length ||
            !row[columnMappings['bib']] || !row[columnMappings['firstName']] || !row[columnMappings['lastName']]) {
            console.warn('Skipping invalid row:', row);
            return;
          }

          const runner: Runner = {
            id: this.runnerDataService.generateUniqueId(),
            bib: row[columnMappings['bib']],
            firstName: row[columnMappings['firstName']],
            lastName: row[columnMappings['lastName']],
            age: parseInt(row[columnMappings['age']]),
            gender: row[columnMappings['gender']],
            town: row[columnMappings['town']],
            state: row[columnMappings['state']],
            customField1: row[columnMappings['customField1']],
            customField2: row[columnMappings['customField2']]
          };

          console.log('Mapped runner:', runner);  // Debug: Log mapped runner

          runners.push(runner);
        },
        complete: () => {
          console.log('Completed mapping runners: ',runners);
          this.runnerDataService.loadRunners(runners);  // Load the runners into the RunnerDataService
          resolve(runners);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

}
