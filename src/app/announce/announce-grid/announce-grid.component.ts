import { Component } from '@angular/core';
import { AnnounceBaseComponent } from "../announce-base.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-announce-grid',
    templateUrl: './announce-grid.component.html',
    styleUrls: ['./announce-grid.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class AnnounceGridComponent extends AnnounceBaseComponent {

}
