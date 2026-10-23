import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";


@Component({
    selector: 'app-announce-freeform',
    templateUrl: './announce-freeform.component.html',
    styleUrls: ['./announce-freeform.component.css'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: []
})
export class AnnounceFreeformComponent extends AnnounceBaseComponent {

}
