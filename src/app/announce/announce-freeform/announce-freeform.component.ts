import { Component } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-announce-freeform',
    templateUrl: './announce-freeform.component.html',
    styleUrls: ['./announce-freeform.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class AnnounceFreeformComponent extends AnnounceBaseComponent {

}
