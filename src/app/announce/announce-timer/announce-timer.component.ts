import { Component } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";
import { CommonModule } from '@angular/common';
import { TimeDurationPipe } from '../../time-duration.pipe';

@Component({
    selector: 'app-announce-timer',
    templateUrl: './announce-timer.component.html',
    styleUrls: ['./announce-timer.component.css'],
    standalone: true,
    imports: [CommonModule, TimeDurationPipe]
})
export class AnnounceTimerComponent extends AnnounceBaseComponent {

}
