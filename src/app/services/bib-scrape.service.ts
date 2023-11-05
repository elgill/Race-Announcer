import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver-es';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "./settings.service";

@Injectable({
  providedIn: 'root'
})
export class BibScrapeService {
  private settings: Settings = DEFAULT_SETTINGS;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
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
}

