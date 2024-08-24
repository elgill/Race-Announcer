import { Component } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";
import {BibScrapeService} from "../services/bib-scrape.service";
import {DEFAULT_SETTINGS, SettingsService, Settings} from "../services/settings.service";

@Component({
  selector: 'app-auto-import',
  templateUrl: './auto-import.component.html',
  styleUrls: ['./auto-import.component.css']
})
export class AutoImportComponent {
  private settings: Settings= DEFAULT_SETTINGS;

  importStatus = '';

  constructor(private bibScrapeService:BibScrapeService, private settingsService: SettingsService) {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  async importRunners() {
    this.importStatus = 'Processing...';
    const url = "https://www.elitefeats.com/Bibs/?ID="+this.settings.raceId+"&csv=yesplease";
    this.importStatus = await this.bibScrapeService.processRunners(url);

  }
}
