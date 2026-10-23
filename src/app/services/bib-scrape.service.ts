import { Injectable, inject } from '@angular/core';
import { ElectronService } from './electron.service';
import { Runner } from '../interfaces/runner';
import { RunnerDataService } from './runner-data.service';

@Injectable({
  providedIn: 'root'
})
export class BibScrapeService {
  private electronService = inject(ElectronService);
  private runnerDataService = inject(RunnerDataService);

  async processRunners(url: string): Promise<string> {
    try {
      const csvData = await this.electronService.fetchText(url);
      const runners = this.parseCSVToRunners(csvData);
      return this.runnerDataService.loadRunners(runners);
    } catch (err) {
      throw 'Error processing the request: ' + err;
    }
  }

  private parseCSVToRunners(csv: string): Runner[] {
    const rows = csv.split('\n');
    const headers = rows[0].split(',');

    const runners: Runner[] = [];

    rows.slice(1).forEach(row => {
      if (!row.trim()) return; // Skip empty rows

      const cells = row.split(',');

      if (cells.length < 9) return;

      const runner: Runner = {
        id: this.runnerDataService.generateUniqueId(),
        bib: cells[0].trim(),
        firstName: cells[1].trim(),
        lastName: cells[2].trim(),
        gender: cells[3].trim(),
        age: parseInt(cells[4].trim(), 10) || 0,
        town: cells[8].trim(),
        state: cells[9].trim(),
        customFields: {}
      };
      // Bib,First 1,Last,Gender 3,Age,Team 5,Division,Shirt 7,City,State 9

      // Map additional columns to customFields if necessary
      runner.customFields["division"] = cells[6].trim();
      runner.customFields["t-shirt"] = cells[7].trim();
      runner.customFields["team"] = cells[5].trim();

      runners.push(runner);
    });

    return runners;
  }

}

