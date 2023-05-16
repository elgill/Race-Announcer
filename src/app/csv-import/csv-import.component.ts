import { Component } from '@angular/core';
import { CsvColumnMappingService } from '../services/csv-column-mapping.service';

@Component({
  selector: 'app-csv-import',
  templateUrl: './csv-import.component.html',
  styleUrls: ['./csv-import.component.css']
})
export class CsvImportComponent {

  file: File | null = null;
  headers: string[] = [];
  mappedColumns: { [key: string]: string } = {};

  constructor(private csvService: CsvColumnMappingService) { }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    if (this.file !== null) {
      this.csvService.getHeaders(this.file)
        .then(headers => {
          this.headers = headers;
        })
        .catch(error => {
          console.error('Error getting headers from CSV file:', error);
          // You could also show an error message to the user here
        });
    }
  }

  onColumnMapped(runnerField: string, event: any) {
    const csvColumn = (event.target as HTMLSelectElement).value;
    this.mappedColumns[csvColumn] = runnerField;
  }

  importCsv() {
    if (this.file !== null) {
      this.csvService.importCsv(this.file, this.mappedColumns);
    }
  }

}
