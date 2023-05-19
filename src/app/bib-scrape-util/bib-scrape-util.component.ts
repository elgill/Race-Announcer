/*// bib-scrape-util.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-bib-scrape-util',
  templateUrl: './bib-scrape-util.component.html',
  styleUrls: ['./bib-scrape-util.component.css']
})
export class BibScrapeUtilComponent {
  url: string;

  constructor(private http: HttpClient) {}

  processTable(): void {
    this.http.get(this.url, { responseType: 'text' }).subscribe((response) => {
      const csvData = this.parseTableToCSV(response);
      this.downloadCSV(csvData);
    });
  }

  parseTableToCSV(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const table = doc.querySelector('table');
    if (table != null) {
      const headers = Array.from(table.querySelectorAll('th')).map((header) => {
        if (header.textContent != null) {
          header.textContent.trim();
        }
      });
      headers.push('Last Name', 'First Name');

      const rows = Array.from(table.querySelectorAll('tr')).slice(1);
      const data = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('td')).map((cell) =>
          cell.textContent.trim()
        );
        if (cells.length >= 2) {
          const nameParts = cells[1].split(', ', 2);
          cells.push(nameParts[0], nameParts[1]);
        } else {
          cells.push('', '');
        }
        return cells;
      });
    }

    const csv = [headers, ...data].map((row) => row.join(',')).join('\n');
    return csv;
  }

  downloadCSV(csvData: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'table_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    link.remove();
  }
}*/

import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import {DEFAULT_SETTINGS, Settings, SettingsService} from "../services/settings.service";

@Component({
  selector: 'app-bib-scrape-util',
  templateUrl: './bib-scrape-util.component.html',
  styleUrls: ['./bib-scrape-util.component.css']
})

export class BibScrapeUtilComponent implements OnInit {
  url: string = '';
  settings: Settings = DEFAULT_SETTINGS;

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
    const corsProxy = this.settings.proxyUrl;
    const proxiedUrl = corsProxy + this.url;
    this.http.get(proxiedUrl, { responseType: 'text' }).subscribe(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const table = doc.querySelector('table');
      if (!table) {
        console.error('No table found');
        return;
      }

      const csv = [];
      const headers = Array.from(table.querySelectorAll('th')).map(header => header.textContent);
      csv.push(headers.join(','));

      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent);
        csv.push(cells.join(','));
      });

      const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' });
      FileSaver.saveAs(blob, 'table_data.csv');
    });
  }
}

