import { Component } from '@angular/core';

import { BibEntryComponent } from '../bib-entry/bib-entry.component';
import { RaceClockComponent } from '../race-clock/race-clock.component';
import { ConnectMatStreamComponent } from '../connect-mat-stream/connect-mat-stream.component';
import { AnnounceGridComponent } from './announce-grid/announce-grid.component';
import { AnnounceFreeformComponent } from './announce-freeform/announce-freeform.component';
import { AnnounceTimerComponent } from './announce-timer/announce-timer.component';
import { ErrorComponent } from '../error/error.component';
import { AnnounceBaseComponent } from './announce-base.component';

@Component({
    selector: 'app-announce',
    templateUrl: './announce-screen.component.html',
    styleUrls: ['./announce-screen.component.css'],
    standalone: true,
    imports: [BibEntryComponent, RaceClockComponent, ConnectMatStreamComponent, AnnounceGridComponent, AnnounceFreeformComponent, AnnounceTimerComponent, ErrorComponent]
})
export class AnnounceScreenComponent extends AnnounceBaseComponent {
}
