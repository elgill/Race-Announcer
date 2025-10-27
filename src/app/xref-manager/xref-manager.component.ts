import { Component, inject } from '@angular/core';
import { RunnerDataService } from '../services/runner-data.service';
import { FormsModule } from '@angular/forms';

import { ImportXrefComponent } from '../import-xref/import-xref.component';
import { ShowXrefComponent } from '../show-xref/show-xref.component';

@Component({
    selector: 'app-xref-manager',
    templateUrl: './xref-manager.component.html',
    styleUrls: ['./xref-manager.component.css'],
    standalone: true,
    imports: [FormsModule, ImportXrefComponent, ShowXrefComponent]
})
export class XrefManagerComponent {
  private runnerDataService = inject(RunnerDataService);

  startingBibNumber: number | null = null;
  startingChipCode: number | null = null;
  numberOfEntries: number | null = null;
  padWithZeros: boolean = true;
  errorMessage: string = '';
  importStatus = '';

  createXrefData(): void {
    if (this.startingBibNumber !== null && this.startingChipCode !== null && this.numberOfEntries !== null) {
      const xrefData = [];
      for (let i = 0; i < this.numberOfEntries; i++) {
        const bib = (this.startingBibNumber + i).toString();
        let chipId = (this.startingChipCode + i).toString();
        if (this.padWithZeros) {
          chipId = chipId.padStart(12, '0');
        }
        xrefData.push({ bib, chipId });
      }
      this.runnerDataService.importXref(xrefData);

      this.clear();
      this.importStatus = 'success';
    } else {
      this.errorMessage = 'Please fill out all fields';
    }
  }

  private clear(): void {
    this.startingBibNumber = null;
    this.startingChipCode = null;
    this.numberOfEntries = null;
    this.importStatus = '';
    this.errorMessage = '';
  }
}
