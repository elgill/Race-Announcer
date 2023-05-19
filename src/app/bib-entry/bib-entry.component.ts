import {Component, HostListener, OnInit} from '@angular/core';
import { RunnerDataService } from '../services/runner-data.service';
import {SettingsService, Settings, DEFAULT_SETTINGS} from "../services/settings.service";

@Component({
  selector: 'app-bib-entry',
  templateUrl: './bib-entry.component.html',
  styleUrls: ['./bib-entry.component.css']
})
export class BibEntryComponent implements OnInit {

  bibNumber: string = '';
  settings: Settings = DEFAULT_SETTINGS;

  constructor(
    private runnerDataService: RunnerDataService,
    private settingsService : SettingsService
  ) { }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.settings = settings;
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.settings && event.key === this.settings.deleteKeybind) {
      this.onRemoveLastRunnerClick();
      this.bibNumber = '';
      event.preventDefault();
      console.log("Bib number curren: ",this.bibNumber);
    }
  }

  onRemoveLastRunnerClick() {
    this.runnerDataService.removeLastRunner();
  }

  onSubmit(): void {
    this.runnerDataService.enterBib(this.bibNumber);
    this.bibNumber = '';
  }

}
