import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {BibScrapeService} from "../services/bib-scrape.service";
import {DEFAULT_SETTINGS, SettingsService} from "../services/settings.service";


@Component({
    selector: 'app-auto-import',
    templateUrl: './auto-import.component.html',
    styleUrls: ['./auto-import.component.css'],
    standalone: true,
    imports: []
})
export class AutoImportComponent {
  private bibScrapeService = inject(BibScrapeService);
  private settingsService = inject(SettingsService);

  private settings = toSignal(this.settingsService.getSettings(), { initialValue: DEFAULT_SETTINGS });

  importStatus = signal('');

  async importRunners() {
    this.importStatus.set('Processing...');
    const url = "https://www.elitefeats.com/Bibs/?ID="+this.settings().raceId+"&csv=yesplease";
    this.importStatus.set(await this.bibScrapeService.processRunners(url));

  }
}
