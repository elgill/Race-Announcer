import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";


@Component({
    selector: 'app-announce-grid',
    templateUrl: './announce-grid.component.html',
    styleUrls: ['./announce-grid.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class AnnounceGridComponent extends AnnounceBaseComponent {

}
