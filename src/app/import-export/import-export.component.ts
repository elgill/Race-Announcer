import { Component } from '@angular/core';
import { CsvImportComponent } from '../csv-import/csv-import.component';
import { CsvExportComponent } from '../csv-export/csv-export.component';

@Component({
    selector: 'app-import-export',
    templateUrl: './import-export.component.html',
    styleUrls: ['./import-export.component.css'],
    standalone: true,
    imports: [CsvImportComponent, CsvExportComponent]
})
export class ImportExportComponent {

}
