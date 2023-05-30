import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {saveAs} from 'file-saver-es';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-bib-scrape-util',
  templateUrl: './bib-scrape-util.component.html',
  styleUrls: ['./bib-scrape-util.component.css']
})

export class BibScrapeUtilComponent implements OnInit {
  url: string = '';
  settings: Settings = DEFAULT_SETTINGS;
  message = '';
  messageType = '';

  constructor(
    private http: HttpClient,
    private settingsService : SettingsService
  ) {}

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  process() {
    this.message = '';
    this.messageType = '';
    return new Promise((resolve, reject) => {
      const corsProxy = this.settings.proxyUrl;
      const proxiedUrl = corsProxy + this.url;
      this.http.get(proxiedUrl, { responseType: 'text' }).subscribe({
        next: (html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const table = doc.querySelector('table');
          if (!table) {
            reject('No table found');
            return;
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
              return (cellText != null && cellText.includes(',')) ? `"${cellText}"` : cellText;
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

          const blob = new Blob([csv.join('\n')], {type: 'text/csv;charset=utf-8'});
          saveAs(blob, 'table_data.csv', { autoBom: false });
          resolve('CSV file successfully created and saved');
        },
        error: (err) => {
          reject('Error processing the request: ' + err);
        }
      });
    }).then((successMessage: any) => {
      this.message = successMessage;
      this.messageType = 'success';
    }).catch(errorMessage => {
      this.message = errorMessage;
      this.messageType = 'error';
    });

  }

}

