import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver-es';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "./settings.service";
import {Runner} from "../interfaces/runner";
import {RunnerDataService} from "./runner-data.service";

@Injectable({
  providedIn: 'root'
})
export class BibScrapeService {
  private settings: Settings = DEFAULT_SETTINGS;
  //private runnerDataService: RunnerDataService;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
    private runnerDataService: RunnerDataService
  ) {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  process(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proxiedUrl = this.getURL(url);
      this.http.get(proxiedUrl, { responseType: 'text' }).subscribe({
        next: (html) => {
          const csv = this.parseHTMLToCSV(html);
          const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
          saveAs(blob, 'table_data.csv', { autoBom: false });
          resolve('CSV file successfully created and saved');
        },
        error: (err) => {
          reject('Error processing the request: ' + err);
        }
      });
    });
  }

  processRunners(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proxiedUrl = this.getURL(url);
      this.http.get(proxiedUrl, { responseType: 'text' }).subscribe({
        next: (html) => {
          const runners = this.parseHTMLToRunners(html);
          const returnStatus = this.runnerDataService.loadRunners(runners)
          resolve(returnStatus);
        },
        error: (err) => {
          reject('Error processing the request: ' + err);
        }
      });
    });
  }

  private getURL(url: string): string {
    // Assume settings are synchronous for this example
    const corsProxy = this.settings.proxyUrl;
    const separator = corsProxy && !corsProxy.endsWith('/') ? '/' : '';
    return corsProxy + separator + url;
  }

  private parseHTMLToCSV(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) {
      throw new Error('No table found');
    }

    const csv = [];
    const headers = Array.from(table.querySelectorAll('th')).map(header => header.textContent);
    headers.push('Last Name', 'First Name'); // Add new headers
    csv.push(headers.join(','));

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(cell => {
        // Escape cell values that contain commas
        const cellText = cell.textContent;
        return (cellText?.includes(',')) ? `"${cellText}"` : cellText;
      });

      if (cells[1]) { // If the name cell exists
        const nameParts = cells[1].split(', ');
        if (nameParts.length === 2) {
          cells.push(nameParts[0].replace("\"", ""), nameParts[1].replace("\"", "")); // Add last name and first name to the end of the row
        } else {
          cells.push('', ''); // Add empty cells if name can't be split into two parts
        }
      }

      csv.push(cells.join(','));
    });

    return csv.join('\n');
  }
  private parseHTMLToRunners(html: string): Runner[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');
    if (!table) {
      throw new Error('No table found');
    }

    // First, map each header title to its index
    const headers = Array.from(table.querySelectorAll('th')).map(th => {
      const header = th.textContent;
      if(header == null){
        return '';
      }
      return header.trim().toLowerCase();
    });
    new Map(headers.map((title, index) => [title, index]));
    const runners: Runner[] = [];
    const rows = table.querySelectorAll('tr');

    Array.from(rows).forEach((row, rowIndex) => {
      if (rowIndex === 0) return; // Skip the header row

      const cells = Array.from(row.querySelectorAll('td'));
      const runner: Runner = {
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

      const standardFields = new Set(['bib', 'name', 'age', 'gender', 'city', 'state']);


      cells.forEach((cell, cellIndex) => {
        // Find the title corresponding to this cell's index
        const title = headers[cellIndex];
        if(cell.textContent != null) {
          if (standardFields.has(title)) {
            switch (title) {
            case 'bib':
              runner.bib = cell.textContent.trim();
              break;
            case 'name': // Assuming the name is in one column, split it
              const nameParts = cell.textContent.trim().split(', ');
              if (nameParts.length === 2) {
                runner.lastName = nameParts[0];
                runner.firstName = nameParts[1];
              }
              break;
            case 'age':
              runner.age = parseInt(cell.textContent.trim(), 10);
              break;
            case 'gender':
              runner.gender = cell.textContent.trim();
              break;
            case 'city':
              runner.town = cell.textContent.trim();
              break;
            case 'state':
              runner.state = cell.textContent.trim();
              break;
            // Add cases for other columns as necessary
            default:
              break;
          }
          } else {
            // Custom field processing
            runner.customFields[title] = cell.textContent.trim();
          }
        }
      });
      runner.id=this.runnerDataService.generateUniqueId();
      runners.push(runner);
    });

    return runners;
  }

}

