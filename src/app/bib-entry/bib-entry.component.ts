import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RunnerDataService } from '../services/runner-data.service';
import {SettingsService, DEFAULT_SETTINGS} from "../services/settings.service";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-bib-entry',
    templateUrl: './bib-entry.component.html',
    styleUrls: ['./bib-entry.component.css'],
    standalone: true,
    imports: [FormsModule]
})
export class BibEntryComponent implements AfterViewInit {
  private runnerDataService = inject(RunnerDataService);
  private settingsService = inject(SettingsService);


  @ViewChild('bibEntryInput') bibEntryInput!: ElementRef;
  bibNumber: string = '';
  private settings = toSignal(this.settingsService.getSettings(), { initialValue: DEFAULT_SETTINGS });

  ngAfterViewInit(): void {
    this.bibEntryInput.nativeElement.focus();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const settings = this.settings();
    if (event.key === settings.deleteKeybind) {
      this.onRemoveLastRunnerClick();
      this.bibNumber = '';
      event.preventDefault();
    } else if (event.key === settings.pauseKeybind){
      this.runnerDataService.togglePause();
    }
  }

  onRemoveLastRunnerClick() {
    this.runnerDataService.removeLastRunner();
  }

  onSubmit(): void {
    const bib: string = this.bibNumber ? this.bibNumber : '';
    this.runnerDataService.enterBib(bib, true, true, 'manual');
    this.bibNumber = '';
  }

}
