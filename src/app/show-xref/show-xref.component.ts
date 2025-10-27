import { Component } from '@angular/core';
import {RunnerDataService} from "../services/runner-data.service";



@Component({
    selector: 'app-show-xref',
    templateUrl: './show-xref.component.html',
    styleUrls: ['./show-xref.component.css'],
    standalone: true,
    imports: []
})
export class ShowXrefComponent {
  showXrefData: boolean = false;
  xrefData: { chipId: string, bib: string }[] = [];

  constructor(private runnerDataService: RunnerDataService) {}

  toggleXrefData(): void {
    this.showXrefData = !this.showXrefData;
    if (this.showXrefData) {
      this.loadXrefData();
    }
  }

  private loadXrefData(): void {
    // Convert the Map to an array for display
    this.xrefData = Array.from(this.runnerDataService.getFullXrefMap().entries()).map(([chipId, bib]) => ({ chipId, bib }));
  }
}
