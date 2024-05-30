import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import { RunnerDataService } from '../services/runner-data.service';
import {SettingsService, Settings, DEFAULT_SETTINGS} from "../services/settings.service";

@Component({
  selector: 'app-bib-entry',
  templateUrl: './bib-entry.component.html',
  styleUrls: ['./bib-entry.component.css']
})
export class BibEntryComponent implements OnInit, AfterViewInit  {

  @ViewChild('bibEntryInput') bibEntryInput!: ElementRef;
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

  ngAfterViewInit(): void {
    this.bibEntryInput.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if(!this.settings){
      return;
    }
    if (event.key === this.settings.deleteKeybind) {
      this.onRemoveLastRunnerClick();
      this.bibNumber = '';
      event.preventDefault();
    } else if (event.key === this.settings.pauseKeybind){
      this.runnerDataService.togglePause();
    }
  }

  onRemoveLastRunnerClick() {
    this.runnerDataService.removeLastRunner();
  }

  onSubmit(): void {
    const bib: string = this.bibNumber ? this.bibNumber : '';
    this.runnerDataService.enterBib(bib,true, true);
    this.bibNumber = '';
  }

}
