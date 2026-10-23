import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";

import { TimeDurationPipe } from '../../time-duration.pipe';

@Component({
    selector: 'app-announce-timer',
    templateUrl: './announce-timer.component.html',
    styleUrls: ['./announce-timer.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TimeDurationPipe]
})
export class AnnounceTimerComponent extends AnnounceBaseComponent {

}
